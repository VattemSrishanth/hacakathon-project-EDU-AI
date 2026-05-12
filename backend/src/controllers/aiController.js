const asyncHandler = require("../utils/asyncHandler");
const { generateWithFallback } = require("../services/aiService");

const ask = asyncHandler(async (req, res) => {
  const { question, mode, context, language, answerStyle } = req.body || {};
  const prompt = `${question || ""}`.trim();
  if (!prompt) {
    return res.status(400).json({ success: false, error: "question is required" });
  }

  const answer = await generateWithFallback({
    prompt,
    imageDataUrl: context?.type === "image" ? context?.data : null,
    language,
    answerStyle
  });

  return res.json({ success: true, answer, mode, context, language, answerStyle });
});

const explainVideo = asyncHandler(async (req, res) => {
  const { videoUrl, question, language, answerStyle } = req.body || {};
  const prompt = `Explain this video for a student. URL: ${videoUrl || ""}. ${question || ""}`.trim();
  const summary = await generateWithFallback({ prompt, language, answerStyle });
  return res.json({ success: true, summary });
});

const analyzeImage = asyncHandler(async (req, res) => {
  const { image, question, language, answerStyle } = req.body || {};
  const prompt = `Analyze the image and answer the question: ${question || ""}`.trim();
  const summary = await generateWithFallback({
    prompt,
    imageDataUrl: image,
    language,
    answerStyle
  });
  return res.json({ success: true, summary });
});

const analyzePdf = asyncHandler(async (req, res) => {
  const { text, question, language, answerStyle } = req.body || {};
  const prompt = `Use the following PDF text to answer.\n\n${text || ""}\n\nQuestion: ${question || ""}`.trim();
  const summary = await generateWithFallback({ prompt, language, answerStyle });
  return res.json({ success: true, summary });
});

module.exports = { ask, explainVideo, analyzeImage, analyzePdf };
