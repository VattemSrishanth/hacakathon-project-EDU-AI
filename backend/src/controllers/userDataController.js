const asyncHandler = require("../utils/asyncHandler");
const UserProfile = require("../models/UserProfile");
const UserProgress = require("../models/UserProgress");
const ChatHistory = require("../models/ChatHistory");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");
const Assignment = require("../models/Assignment");

const defaultProgress = () => ({
  lessonsCompleted: [],
  totalLessons: 50,
  timeSpent: { totalMinutes: 0, byLesson: {}, byDay: {} },
  quizScores: [],
  activityLog: [],
  lastActivityTimestamp: Date.now(),
  questionsAsked: 0
});

const getProfile = asyncHandler(async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ success: false, error: "user_id is required" });
  }

  let profile = await UserProfile.findOne({ user_id: userId }).lean();
  if (!profile) {
    profile = await UserProfile.create({ user_id: userId, data: {} });
  }

  return res.json({ success: true, profile: profile.data });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { id, ...data } = req.body || {};
  const userId = id || req.query.user_id;
  if (!userId) {
    return res.status(400).json({ success: false, error: "user_id is required" });
  }

  const profile = await UserProfile.findOneAndUpdate(
    { user_id: userId },
    { data },
    { upsert: true, new: true }
  ).lean();

  return res.json({ success: true, profile: profile.data });
});

const getProgress = asyncHandler(async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ success: false, error: "user_id is required" });
  }

  let progressDoc = await UserProgress.findOne({ user_id: userId }).lean();
  if (!progressDoc) {
    progressDoc = await UserProgress.create({ user_id: userId, progress: defaultProgress() });
  }

  return res.json({ success: true, progress: progressDoc.progress });
});

const updateProgress = asyncHandler(async (req, res) => {
  const userId = req.query.user_id || req.body.userId;
  if (!userId) {
    return res.status(400).json({ success: false, error: "user_id is required" });
  }

  const progressDoc = await UserProgress.findOneAndUpdate(
    { user_id: userId },
    { progress: req.body },
    { upsert: true, new: true }
  ).lean();

  return res.json({ success: true, progress: progressDoc.progress });
});

const saveChatHistory = asyncHandler(async (req, res) => {
  const userId = req.query.user_id;
  const { messages, sessionId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ success: false, error: "user_id is required" });
  }

  const history = await ChatHistory.findOneAndUpdate(
    { user_id: userId, session_id: sessionId || "default" },
    { messages: messages || [] },
    { upsert: true, new: true }
  ).lean();

  return res.json({ success: true, history: history.messages });
});

const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ success: false, error: "user_id is required" });
  }

  const sessionId = req.query.session_id || "default";
  const history = await ChatHistory.findOne({ user_id: userId, session_id: sessionId }).lean();
  return res.json({ success: true, history: history ? history.messages : [] });
});

const clearChatHistory = asyncHandler(async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ success: false, error: "user_id is required" });
  }

  const sessionId = req.query.session_id;
  if (sessionId) {
    await ChatHistory.deleteOne({ user_id: userId, session_id: sessionId });
  } else {
    await ChatHistory.deleteMany({ user_id: userId });
  }

  return res.json({ success: true });
});

const submitFeedback = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  await Feedback.create({ user_id: payload.user_id || null, payload });
  return res.json({ success: true });
});

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ success: false, error: "user_id is required" });
  }

  const notifications = await Notification.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ success: true, notifications });
});

const markNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ success: false, error: "user_id is required" });
  }

  await Notification.updateMany({ user_id: userId }, { read: true });
  return res.json({ success: true });
});

const getAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find({}).sort({ dueDate: 1 }).lean();
  if (!assignments.length) {
    const seed = [
      {
        title: "Maths Practice Worksheet",
        description: "Complete exercises on fractions and decimals.",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: "Pending",
        subject: "Maths",
        class_level: "6",
        board: "NCERT"
      },
      {
        title: "Science Lab Notes",
        description: "Summarize the chapter on Light, Shadows and Reflections.",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: "Submitted",
        subject: "Science",
        class_level: "6",
        board: "NCERT"
      }
    ];
    const created = await Assignment.insertMany(seed);
    return res.json({ success: true, assignments: created });
  }

  return res.json({ success: true, assignments });
});

const syncOffline = asyncHandler(async (req, res) => {
  const { actions } = req.body || {};
  const count = Array.isArray(actions) ? actions.length : 0;
  return res.json({ success: true, message: "Sync processed", count });
});

module.exports = {
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
};
