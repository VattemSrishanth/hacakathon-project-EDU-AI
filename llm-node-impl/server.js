const express = require('express');
const { generateWithFallback, validateConfig } = require('./llmService');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Run fast-fail configuration check on startup
try {
    validateConfig();
} catch (error) {
    console.error(`[CRITICAL] Server failed to start: ${error.message}`);
    process.exit(1);
}

/**
 * AI Tutor Endpoint
 * POST /api/ask
 */
app.post('/api/ask', async (req, res) => {
    const { question, mode = 'regular' } = req.body;

    if (!question) {
        return res.status(400).json({ error: "No question provided" });
    }

    try {
        // Construct prompt with mode guidance if necessary
        const fullPrompt = `Mode: ${mode}\nQuestion: ${question}`;
        
        const result = await generateWithFallback(fullPrompt);

        if (result.success) {
            res.json({
                answer: result.text,
                provider: result.provider,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                error: "All AI providers are currently exhausted.",
                details: result.error
            });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Resilient AI Backend listening at http://localhost:${port}`);
});
