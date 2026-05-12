const express = require("express");
const {
  getProfile,
  updateProfile,
  getProgress,
  updateProgress,
  saveChatHistory,
  getChatHistory,
  clearChatHistory,
  submitFeedback,
  getNotifications,
  markNotificationsRead,
  getAssignments,
  syncOffline
} = require("../controllers/userDataController");

const router = express.Router();

router.get("/profile", getProfile);
router.post("/profile", updateProfile);
router.get("/progress", getProgress);
router.post("/progress", updateProgress);
router.post("/history", saveChatHistory);
router.get("/history", getChatHistory);
router.delete("/history", clearChatHistory);
router.post("/feedback", submitFeedback);
router.get("/notifications", getNotifications);
router.put("/notifications/read", markNotificationsRead);
router.get("/assignments", getAssignments);
router.post("/sync", syncOffline);

module.exports = router;
