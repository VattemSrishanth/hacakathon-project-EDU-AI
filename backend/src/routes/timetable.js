const express = require("express");
const Timetable = require("../models/Timetable");
const { generateTimetable } = require("../services/timetableService");
const auth = require("../middleware/auth");
const router = express.Router();

// Generate new AI timetable
router.post("/generate", auth, async (req, res) => {
  const { college, branch, semester, subjects } = req.body;
  const userId = req.user.userId;

  if (!college || !branch || !semester) {
    return res.status(400).json({ success: false, error: "college, branch, semester are required" });
  }

  try {
    const timetable = await generateTimetable(userId, college, branch, semester, subjects || []);
    return res.json({ success: true, timetable });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch current timetable
router.get("/me", auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const timetable = await Timetable.findOne({ userId });
    if (!timetable) {
      return res.json({ success: true, timetable: null });
    }
    return res.json({ success: true, timetable });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
