const express = require("express");
const TeacherProfile = require("../models/TeacherProfile");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Apply for verification (Teacher only)
router.post("/apply", auth, async (req, res) => {
  const { degreeUrl, subjects, languages, phone, experience } = req.body;
  const userId = req.user.userId;

  try {
    const profile = await TeacherProfile.findOneAndUpdate(
      { userId },
      {
        degreeUrl,
        subjects: subjects || [],
        languages: languages || [],
        phone: phone || "",
        experience: Number(experience || 1),
        verificationStatus: "pending"
      },
      { new: true, upsert: true }
    );

    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Check status (Teacher only)
router.get("/status", auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const profile = await TeacherProfile.findOne({ userId });
    if (!profile) {
      return res.json({ success: true, status: "none" });
    }
    return res.json({ success: true, profile, status: profile.verificationStatus });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint: List pending approvals
router.get("/admin/pending", auth, async (req, res) => {
  try {
    // Basic role check
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied. Admin access only." });
    }

    const pending = await TeacherProfile.find({ verificationStatus: "pending" })
      .populate("userId", "name email");

    return res.json({ success: true, pending });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint: Moderate approval
router.post("/admin/approve", auth, async (req, res) => {
  const { teacherUserId, action } = req.body; // action: "approve" or "reject"

  try {
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied." });
    }

    const verificationStatus = action === "approve" ? "verified" : "rejected";
    const profile = await TeacherProfile.findOneAndUpdate(
      { userId: teacherUserId },
      { verificationStatus },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, error: "Teacher profile not found" });
    }

    // If approved, update user role to "teacher"
    if (action === "approve") {
      await User.findByIdAndUpdate(teacherUserId, { role: "teacher" });
    }

    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Dev bypass: instantly verify any user as a teacher
router.post("/dev-verify", auth, async (req, res) => {
  const userId = req.user.userId;
  try {
    const profile = await TeacherProfile.findOneAndUpdate(
      { userId },
      {
        verificationStatus: "verified",
        isOnline: true,
        isFree: true,
        subjects: ["Mathematics", "Science", "English", "Social Studies", "Physics", "Chemistry", "Biology", "Computer Science"],
        languages: ["English", "Telugu", "Hindi", "Spanish", "French"],
        rating: 5.0,
        experience: 5
      },
      { new: true, upsert: true }
    );
    await User.findByIdAndUpdate(userId, { role: "teacher" });
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
