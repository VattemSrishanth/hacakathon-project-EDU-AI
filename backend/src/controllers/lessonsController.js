const asyncHandler = require("../utils/asyncHandler");
const Lesson = require("../models/Lesson");

const listLessons = asyncHandler(async (req, res) => {
  const { category, level } = req.query;
  const query = {};
  if (category) query.category = category;
  if (level) query.level = level;

  const lessons = await Lesson.find(query).sort({ createdAt: -1 }).lean();
  return res.json({ success: true, lessons });
});

const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).lean();
  if (!lesson) {
    return res.status(404).json({ success: false, error: "Lesson not found" });
  }
  return res.json({ success: true, lesson });
});

const getLessonContent = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).lean();
  if (!lesson) {
    return res.status(404).json({ success: false, error: "Lesson not found" });
  }
  return res.json({ success: true, content: lesson.content || {} });
});

const listCategories = asyncHandler(async (req, res) => {
  const categories = await Lesson.distinct("category");
  return res.json({ success: true, categories });
});

const generateLesson = asyncHandler(async (req, res) => {
  const { topic, subject, unit, grade, mode, language } = req.body || {};
  const description = `Generated ${mode || "detailed"} lesson for ${topic || "topic"} (${subject || "subject"})`;
  const explanation = [
    description,
    `Grade: ${grade || "N/A"}`,
    unit ? `Unit: ${unit}` : null,
    language ? `Language: ${language}` : null
  ]
    .filter(Boolean)
    .join("\n");

  return res.json({ success: true, explanation });
});

module.exports = { listLessons, getLesson, getLessonContent, listCategories, generateLesson };
