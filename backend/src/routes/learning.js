const express = require("express");
const { nextChapter, learningPath } = require("../controllers/learningController");

const router = express.Router();

router.get("/next-chapter", nextChapter);
router.get("/learning-path", learningPath);

module.exports = router;
