const express = require("express");
const {
  getStats,
  createLesson,
  updateLesson,
  deleteLesson,
  createUser,
  updateUser,
  resetUserPassword,
  saveSyllabusContent,
  deleteSyllabusContent
} = require("../controllers/adminController");

const router = express.Router();

router.get("/admin/:adminId/stats", getStats);
router.post("/admin/lessons", createLesson);
router.put("/admin/lessons/:id", updateLesson);
router.delete("/admin/lessons/:id", deleteLesson);
router.post("/admin/users", createUser);
router.put("/admin/users/:id", updateUser);
router.post("/admin/users/:id/reset-password", resetUserPassword);
router.post("/admin/syllabus-content", saveSyllabusContent);
router.delete("/admin/syllabus-content", deleteSyllabusContent);

module.exports = router;
