const express = require("express");
const DoubtSession = require("../models/DoubtSession");
const TeacherProfile = require("../models/TeacherProfile");
const auth = require("../middleware/auth");
const router = express.Router();

// Get session history
router.get("/history", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await DoubtSession.find({
      $or: [{ studentId: userId }, { teacherId: userId }]
    })
      .populate("studentId", "name email")
      .populate("teacherId", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, history });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Submit ratings & feedback
router.post("/:id/rate", auth, async (req, res) => {
  const { rating, feedback } = req.body;
  const sessionId = req.params.id;

  try {
    const session = await DoubtSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: "Session not found" });
    }

    session.rating = Number(rating);
    session.feedback = feedback || "";
    await session.save();

    // Recalculate teacher average rating
    if (session.teacherId) {
      const allTeacherSessions = await DoubtSession.find({
        teacherId: session.teacherId,
        rating: { $exists: true }
      });

      const totalRating = allTeacherSessions.reduce((sum, s) => sum + s.rating, 0);
      const avgRating = allTeacherSessions.length > 0 ? totalRating / allTeacherSessions.length : 5.0;

      await TeacherProfile.findOneAndUpdate(
        { userId: session.teacherId },
        { rating: avgRating }
      );
    }

    return res.json({ success: true, session });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
