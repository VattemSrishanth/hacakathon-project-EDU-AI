const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

const login = asyncHandler(async (req, res) => {
  const { email, name } = req.body || {};
  if (!email || !name) {
    return res.status(400).json({ error: "email and name are required" });
  }

  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await User.create({ email: email.toLowerCase(), name });
  }

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );

  return res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
});

const getProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId)
    .populate("last_opened.class_id")
    .populate("last_opened.subject_id")
    .populate("last_opened.chapter_id")
    .lean();

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    last_opened: user.last_opened || null,
    completed_chapters: user.completed_chapters || []
  });
});

const updateProgress = asyncHandler(async (req, res) => {
  const { last_opened, completed_chapters } = req.body || {};

  const update = {};
  if (last_opened) {
    update.last_opened = last_opened;
  }
  if (completed_chapters) {
    update.completed_chapters = completed_chapters;
  }

  const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true }).lean();
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    last_opened: user.last_opened || null,
    completed_chapters: user.completed_chapters || []
  });
});

module.exports = { login, getProgress, updateProgress };
