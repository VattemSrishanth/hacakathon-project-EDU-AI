const express = require("express");
const { generateQuiz } = require("../controllers/quizController");

const router = express.Router();

router.post("/quiz/generate", generateQuiz);

module.exports = router;
