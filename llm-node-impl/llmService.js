const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
require("dotenv").config();

/**
 * CLEAN KEY UTILITY
 * Common issue: .env files sometimes wrap keys in quotes or have trailing spaces
 */
const getCleanKey = (keyName) => {
    const rawValue = process.env[keyName] || "";
    return rawValue.replace(/['"]+/g, '').trim();
};

// Initialize API Clients with cleaned keys
const GEMINI_KEY = getCleanKey("GEMINI_API_KEY");
const GROQ_KEY = getCleanKey("GROQ_API_KEY");

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const groq = new Groq({ apiKey: GROQ_KEY });

/**
 * STARTUP VALIDATION
 * Fails fast if configuration is missing or looks obviously wrong
 */
function validateConfig() {
    console.log("[NodeLLM] Validating configuration...");
    if (!GEMINI_KEY || GEMINI_KEY.length < 30) {
        throw new Error("CRITICAL: GEMINI_API_KEY is missing or too short. Check your .env file.");
    }
    if (!GROQ_KEY) {
        console.warn("[NodeLLM] WARNING: GROQ_API_KEY (Backup) is missing.");
    }
    console.log("[NodeLLM] Configuration Validated: Gemini (Primary) and Groq (Backup) initialized.");
}

/**
 * ERROR CLASSIFIER
 * Distinguishes between different types of failures for better logging/routing
 */
function classifyError(error) {
    const msg = (error.message || "").toLowerCase();
    
    // Auth / Key related
    if (msg.includes("api_key_invalid") || msg.includes("unauthorized") || msg.includes("expired") || msg.includes("api key")) {
        return { type: "INVALID_KEY", message: "API key is invalid or expired. Check AI Studio permissions." };
    }
    
    // Quota / Rate limits
    if (msg.includes("429") || msg.includes("quota") || msg.includes("too many requests")) {
        return { type: "QUOTA_EXCEEDED", message: "Rate limit reached for this provider." };
    }
    
    // Model / Endpoint mismatch
    if (msg.includes("not found") || msg.includes("404") || msg.includes("model")) {
        return { type: "MODEL_MISMATCH", message: "Model name or API endpoint configuration error." };
    }

    return { type: "UNKNOWN", message: error.message };
}

/**
 * SLEEP UTILITY for handling propagation delay retries
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * PRIMARY PROVIDER: Gemini
 * Includes retry logic for transient errors or propagation delays
 */
async function callGemini(prompt, options, retry = true) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await Promise.race([
            model.generateContent(prompt),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini Timeout after 20s")), 20000))
        ]);

        const response = await result.response;
        const text = response.text();
        
        if (!text || text.trim().length === 0) throw new Error("Empty response from Gemini");
        return { text, provider: "gemini", success: true };

    } catch (error) {
        const info = classifyError(error);
        console.error(`[NodeLLM][Gemini Error] Type: ${info.type}, Detail: ${info.message}`);

        // HANDLE PROPAGATION DELAY: 
        // If it's the first try and looks like a key issue, wait 2s and try once more.
        if (retry && info.type === "INVALID_KEY") {
            console.log("[NodeLLM] Possible propagation delay. Retrying Gemini in 2 seconds...");
            await sleep(2000);
            return callGemini(prompt, options, false);
        }
        
        throw error; // Re-throw for handleFallback to catch
    }
}

/**
 * Resilient generating function that tries Gemini first and falls back to Groq.
 * @param {string} prompt - The user prompt.
 * @param {object} options - Generation options (temperature, etc).
 * @returns {Promise<object>} - { text: string, provider: string, success: boolean }
 */
async function generateWithFallback(prompt, options = {}) {
    const { temperature = 0.5, maxTokens = 512 } = options;

    // 1. Try Gemini (Primary)
    try {
        console.log("[NodeLLM] Attempting Gemini Call...");
        return await callGemini(prompt, { temperature, maxTokens });
    } catch (geminiError) {
        console.warn("[NodeLLM] Gemini was unsuccessful. Initiating Groq Fallback...");
        
        // 2. Fallback to Groq (Backup)
        try {
            console.log("[NodeLLM] Calling Groq (llama-3.3-70b-versatile)...");
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: temperature,
                max_tokens: maxTokens,
            });

            const text = completion.choices[0]?.message?.content || "";
            if (text) {
                return { text, provider: "groq", success: true };
            }
            throw new Error("Empty response from Groq");

        } catch (groqError) {
            const groqInfo = classifyError(groqError);
            console.error(`[NodeLLM][Groq Error] Type: ${groqInfo.type}, Detail: ${groqInfo.message}`);
            return { 
                text: "AI service is temporarily offline. Our engineers are notified.", 
                provider: "none", 
                success: false, 
                error: groqInfo.message 
            };
        }
    }
}

module.exports = { generateWithFallback, validateConfig };
