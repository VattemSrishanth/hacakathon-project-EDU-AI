const DEFAULT_TIMEOUT_MS = 20000;

const buildSystemPrompt = ({ language, answerStyle }) => {
  const lang = language || "English";
  const style = answerStyle || "Detailed";
  return `You are an education tutor. Answer in ${lang}. Style: ${style}. Be clear and student-friendly.`;
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

const callGemini = async ({ prompt, image, systemPrompt }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  const parts = [{ text: `${systemPrompt}\n\n${prompt}`.trim() }];
  if (image) {
    parts.push({ inlineData: image });
  }

  const body = {
    contents: [{ role: "user", parts }]
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

const callGroq = async ({ prompt, systemPrompt }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing");
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
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
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
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

const generateWithFallback = async ({ prompt, imageDataUrl, language, answerStyle }) => {
  const systemPrompt = buildSystemPrompt({ language, answerStyle });
  const image = parseDataUrl(imageDataUrl);

  try {
    return await callGemini({ prompt, image, systemPrompt });
  } catch (geminiError) {
    const fallbackPrompt = image
      ? `${prompt}\n\n[Note: Image input omitted in fallback.]`
      : prompt;
    return await callGroq({ prompt: fallbackPrompt, systemPrompt });
  }
};

module.exports = { generateWithFallback };
