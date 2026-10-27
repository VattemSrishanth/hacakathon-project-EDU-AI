const DEFAULT_TIMEOUT_MS = 25000;

const buildSystemPrompt = ({ language, answerStyle }) => {
  const lang = language || "English";
  const style = answerStyle || "Detailed";
  return `You are an expert, encouraging, student-friendly AI education tutor.
You are having an ongoing conversation with a student.
Always remember and refer back to previous messages, questions, explanations, images, and context discussed in this conversation.
Respond in ${lang}.
Answer style: ${style}.
Provide clear, accurate, conversational explanations. When the student makes a correction, refers to something mentioned earlier (e.g., using "it", "that", "why", "who", "they"), or asks follow-up questions, directly acknowledge and build on the previous turns of this conversation.`;
};

const extractText = (response) => {
  if (!response) return null;
  const candidates = response.candidates || [];
  const content = candidates[0]?.content;
  const parts = content?.parts || [];
  const text = parts.find((part) => typeof part.text === "string")?.text;
  return text || null;
};

const parseDataUrl = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
};

const buildGeminiContents = ({ prompt, history, image }) => {
  const contents = [];

  if (Array.isArray(history) && history.length > 0) {
    // Keep up to the last 20 messages for rich multi-turn conversation memory
    const recentHistory = history.slice(-20);
    for (const item of recentHistory) {
      if (!item) continue;
      const role = item.role === "assistant" || item.role === "model" ? "model" : "user";
      const text = typeof item.content === "string" ? item.content.trim() : String(item.content || "");
      if (!text && !item.imageUrl) continue;

      const parts = [];
      if (text) {
        parts.push({ text });
      }
      if (item.imageUrl) {
        const parsedImg = parseDataUrl(item.imageUrl);
        if (parsedImg) {
          parts.push({ inlineData: parsedImg });
        }
      }

      // Gemini requires contents to start with "user"
      if (contents.length === 0 && role !== "user") {
        continue; // Skip initial bot greeting if at the very start
      }

      // Gemini requires alternating roles (user, model, user, model...)
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts.push(...parts);
      } else {
        contents.push({ role, parts });
      }
    }
  }

  // Now append current user turn
  const currentParts = [{ text: prompt }];
  if (image) {
    currentParts.push({ inlineData: image });
  }

  if (contents.length > 0 && contents[contents.length - 1].role === "user") {
    contents[contents.length - 1].parts.push(...currentParts);
  } else {
    contents.push({ role: "user", parts: currentParts });
  }

  return contents;
};

const callGemini = async ({ prompt, history, image, systemPrompt }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  const contents = buildGeminiContents({ prompt, history, image });

  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini error: ${response.status} ${text}`);
    }

    const payload = await response.json();
    const text = extractText(payload);
    if (!text) {
      throw new Error("Gemini returned empty response");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
};

const buildGroqMessages = ({ prompt, history, systemPrompt }) => {
  const msgs = [{ role: "system", content: systemPrompt }];

  if (Array.isArray(history) && history.length > 0) {
    const recentHistory = history.slice(-20);
    for (const item of recentHistory) {
      if (!item || !item.content) continue;
      const role = item.role === "assistant" || item.role === "model" ? "assistant" : "user";
      let content = typeof item.content === "string" ? item.content.trim() : String(item.content || "");
      if (item.imageUrl && !content) {
        content = "[User attached an image]";
      }
      if (content) {
        msgs.push({ role, content });
      }
    }
  }

  msgs.push({ role: "user", content: prompt });
  return msgs;
};

const callGroq = async ({ prompt, history, systemPrompt }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const messages = buildGroqMessages({ prompt, history, systemPrompt });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq error: ${response.status} ${text}`);
    }

    const payload = await response.json();
    const text = payload.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("Groq returned empty response");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
};

const generateWithFallback = async ({ prompt, history = [], imageDataUrl, language, answerStyle }) => {
  const systemPrompt = buildSystemPrompt({ language, answerStyle });
  const image = parseDataUrl(imageDataUrl);

  try {
    return await callGemini({ prompt, history, image, systemPrompt });
  } catch (geminiError) {
    console.error("Gemini call failed, falling back to Groq:", geminiError.message);
    const fallbackPrompt = image
      ? `${prompt}\n\n[Note: Image input omitted in fallback.]`
      : prompt;
    return await callGroq({ prompt: fallbackPrompt, history, systemPrompt });
  }
};

module.exports = { generateWithFallback };
