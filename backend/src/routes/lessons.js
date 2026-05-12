const express = require("express");
const {
  listLessons,
  getLesson,
  getLessonContent,
  listCategories,
  generateLesson
} = require("../controllers/lessonsController");

const router = express.Router();

router.get("/lessons", listLessons);
router.get("/lessons/:id", getLesson);
router.get("/lessons/:id/content", getLessonContent);
router.get("/categories", listCategories);
router.post("/lessons/generate", generateLesson);

module.exports = router;
