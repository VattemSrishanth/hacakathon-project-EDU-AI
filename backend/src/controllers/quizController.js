const asyncHandler = require("../utils/asyncHandler");

const generateQuiz = asyncHandler(async (req, res) => {
  const { pdf_name, count } = req.body || {};
  const total = Math.max(Number(count || 5), 1);

  const questions = Array.from({ length: total }).map((_, index) => ({
    id: index + 1,
    type: "mcq",
    question: `Sample question ${index + 1} from ${pdf_name || "PDF"}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correct_answer: "Option A",
    explanation: "This is a placeholder explanation."
  }));

  return res.json({ success: true, questions });
});

module.exports = { generateQuiz };
