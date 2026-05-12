const asyncHandler = require("../utils/asyncHandler");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const SyllabusContent = require("../models/SyllabusContent");
const { hashPassword } = require("../utils/password");

const getStats = asyncHandler(async (req, res) => {
  const [users, lessons] = await Promise.all([
    User.countDocuments(),
    Lesson.countDocuments()
  ]);

  return res.json({
    success: true,
    stats: {
      users,
      lessons,
      activeUsers: users,
      pendingApprovals: 0
    }
  });
});

const createLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.create(req.body || {});
  return res.json({ success: true, lesson });
});

const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body || {}, { new: true }).lean();
  if (!lesson) {
    return res.status(404).json({ success: false, error: "Lesson not found" });
  }
  return res.json({ success: true, lesson });
});

const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id).lean();
  if (!lesson) {
    return res.status(404).json({ success: false, error: "Lesson not found" });
  }
  return res.json({ success: true });
});

const createUser = asyncHandler(async (req, res) => {
  const payload = { ...(req.body || {}) };
  if (payload.password) {
    payload.password_hash = hashPassword(payload.password);
    delete payload.password;
  }
  const user = await User.create(payload);
  return res.json({ success: true, user });
});

const updateUser = asyncHandler(async (req, res) => {
  const payload = { ...(req.body || {}) };
  if (payload.password) {
    payload.password_hash = hashPassword(payload.password);
    delete payload.password;
  }
  const user = await User.findByIdAndUpdate(req.params.id, payload, { new: true }).lean();
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  return res.json({ success: true, user });
});

const resetUserPassword = asyncHandler(async (req, res) => {
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ success: false, error: "password is required" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  user.password_hash = hashPassword(password);
  await user.save();
  return res.json({ success: true });
});

const saveSyllabusContent = asyncHandler(async (req, res) => {
  const { board, class_level, subject, topic } = req.body || {};
  if (!board || !class_level || !subject || !topic) {
    return res
      .status(400)
      .json({ success: false, error: "board, class_level, subject, topic are required" });
  }

  const content = await SyllabusContent.findOneAndUpdate(
    { board, class_level, subject, topic },
    req.body,
    { upsert: true, new: true }
  ).lean();

  return res.json({ success: true, content });
});

const deleteSyllabusContent = asyncHandler(async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ success: false, error: "id is required" });
  }

  await SyllabusContent.findByIdAndDelete(id);
  return res.json({ success: true });
});

module.exports = {
  getStats,
  createLesson,
  updateLesson,
  deleteLesson,
  createUser,
  updateUser,
  resetUserPassword,
  saveSyllabusContent,
  deleteSyllabusContent
};
