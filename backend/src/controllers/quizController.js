const asyncHandler = require("../utils/asyncHandler");
const { generateWithFallback } = require("../services/aiService");

const generateQuiz = asyncHandler(async (req, res) => {
  const { pdf_name, count } = req.body || {};
  const total = Math.max(Number(count || 5), 1);

  const prompt = `You are a professional quiz creator. Generate a list of exactly ${total} multiple choice questions (MCQ) about the topic: "${pdf_name || "General Knowledge"}".
Format the output strictly as a JSON array where each object has this exact structure:
[
  {
    "id": 1,
    "type": "mcq",
    "question": "Clear question text?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correct_answer": "Option 1",
    "explanation": "Brief explanation of the answer."
  }
]
Return ONLY raw JSON. Do not wrap it in backticks or markdown markers.`;

  try {
    const aiResponse = await generateWithFallback({
      prompt,
      language: "English",
      answerStyle: "Structured JSON"
    });

    const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const questions = JSON.parse(cleanJson);
    return res.json({ success: true, questions });
  } catch (err) {
    console.error("AI quiz generation failed, using fallback quiz generator:", err);
    // Dynamic fallback
    const questions = Array.from({ length: total }).map((_, index) => ({
      id: index + 1,
      type: "mcq",
      question: `Review question ${index + 1} regarding ${pdf_name || "the uploaded materials"}.`,
      options: ["True", "False", "Partially True", "Not enough information"],
      correct_answer: "True",
      explanation: "This is a verification check question based on your studies."
    }));
    return res.json({ success: true, questions });
  }
});

module.exports = { generateQuiz };
