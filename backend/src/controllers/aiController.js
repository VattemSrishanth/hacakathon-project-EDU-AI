const asyncHandler = require("../utils/asyncHandler");
const { generateWithFallback } = require("../services/aiService");

const ask = asyncHandler(async (req, res) => {
  const { question, mode, context, language, answerStyle, history } = req.body || {};
  let prompt = `${question || ""}`.trim();

  if (!prompt && !context) {
    return res.status(400).json({ success: false, error: "question is required" });
  }

  // Enrich prompt if there is non-image context attached (like PDF or YouTube)
  if (context?.type === "pdf" && context?.name) {
    prompt = `[Attached Document: "${context.name}"]\n\n${prompt || "Please explain and summarize this document."}`;
  } else if (context?.type === "youtube" && context?.data) {
    prompt = `[Attached Video URL: ${context.data}]\n\n${prompt || "Please explain this video topic."}`;
  }

  const answer = await generateWithFallback({
    prompt: prompt || "Please help me with this.",
    history: Array.isArray(history) ? history : [],
    imageDataUrl: context?.type === "image" ? context?.data : null,
    language,
    answerStyle
  });

  return res.json({ success: true, answer, mode, context, language, answerStyle });
});

const explainVideo = asyncHandler(async (req, res) => {
  const { videoUrl, question, language, answerStyle, history } = req.body || {};
  const prompt = `Explain this video for a student. URL: ${videoUrl || ""}. ${question || ""}`.trim();
  const summary = await generateWithFallback({
    prompt,
    history: Array.isArray(history) ? history : [],
    language,
    answerStyle
  });
  return res.json({ success: true, summary });
});

const analyzeImage = asyncHandler(async (req, res) => {
  const { image, question, language, answerStyle, history } = req.body || {};
  const prompt = `Analyze the image and answer the question: ${question || ""}`.trim();
  const summary = await generateWithFallback({
    prompt,
    history: Array.isArray(history) ? history : [],
    imageDataUrl: image,
    language,
    answerStyle
  });
  return res.json({ success: true, summary });
});

const analyzePdf = asyncHandler(async (req, res) => {
  const { text, question, language, answerStyle, history } = req.body || {};
  const prompt = `Use the following PDF text to answer.\n\n${text || ""}\n\nQuestion: ${question || ""}`.trim();
  const summary = await generateWithFallback({
    prompt,
    history: Array.isArray(history) ? history : [],
    language,
    answerStyle
  });
  return res.json({ success: true, summary });
});

module.exports = { ask, explainVideo, analyzeImage, analyzePdf };
