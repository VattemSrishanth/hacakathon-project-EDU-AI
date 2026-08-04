const express = require("express");
const {
  getStats,
  getUsersList,
  performUserBulkAction,
  getTeacherVerifications,
  verifyTeacher,
  getLiveMentorLogs,
  getModerationLogs,
  respondToAppeal,
  scheduleNotification,
  getReportsData,
  getSystemHealthStatus,
  getAdminSettings,
  saveAdminSettings,
  createLesson,
  updateLesson,
  deleteLesson,
  createUser,
  updateUser,
  resetUserPassword,
  saveSyllabusContent,
  deleteSyllabusContent
} = require("../controllers/adminController");
const auth = require("../middleware/auth");

const router = express.Router();

// Stats overview
router.get("/admin/:adminId/stats", auth, getStats);

// User Management routes
router.get("/admin/users/list", auth, getUsersList);
router.post("/admin/users/bulk", auth, performUserBulkAction);

// Teacher Verification routes
router.get("/admin/verifications", auth, getTeacherVerifications);
router.post("/admin/verifications/:id/verify", auth, verifyTeacher);

// Live Mentor dispatch monitoring
router.get("/admin/live-mentor/logs", auth, getLiveMentorLogs);

// Chat moderation log routes
router.get("/admin/moderation/logs", auth, getModerationLogs);
router.post("/admin/moderation/appeal", auth, respondToAppeal);

// Notification and Scheduler trigger routes
router.post("/admin/notifications/schedule", auth, scheduleNotification);

// Analytics and Reports aggregation routes
router.get("/admin/analytics/reports", auth, getReportsData);

// Realtime system health monitoring
router.get("/admin/system/health", auth, getSystemHealthStatus);

// Global settings configurations
router.get("/admin/settings/config", auth, getAdminSettings);
router.post("/admin/settings/config", auth, saveAdminSettings);

// Preserved old learning content operations
router.post("/admin/lessons", auth, createLesson);
router.put("/admin/lessons/:id", auth, updateLesson);
router.delete("/admin/lessons/:id", auth, deleteLesson);
router.post("/admin/users", auth, createUser);
router.put("/admin/users/:id", auth, updateUser);
router.post("/admin/users/:id/reset-password", auth, resetUserPassword);
router.post("/admin/syllabus-content", auth, saveSyllabusContent);
router.delete("/admin/syllabus-content", auth, deleteSyllabusContent);

module.exports = router;
