const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const { hashPassword } = require("../utils/password");

const toUserPayload = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  role: user.role,
  username: user.username,
  avatarUrl: user.avatar_url
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "name, email, password are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, error: "User already exists" });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    role: role || "student",
    password_hash: hashPassword(password)
  });

  return res.json({ success: true, user: toUserPayload(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );

  return res.json({ success: true, token, user: toUserPayload(user) });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).lean();
  if (!user) {
    return res.status(404).json({ status: "error", error: "User not found" });
  }

  return res.json({ status: "ok", user: toUserPayload(user) });
});

const getDevCredentials = (req, res) => {
  return res.json({
    success: true,
    credentials: {
      student: { email: process.env.STUDENT_EMAIL || "student@eduai.com", password: process.env.STUDENT_PASSWORD || "student123" },
      teacher: { email: process.env.TEACHER_EMAIL || "teacher@eduai.com", password: process.env.TEACHER_PASSWORD || "teacher123" },
      parent: { email: process.env.PARENT_EMAIL || "parent@eduai.com", password: process.env.PARENT_PASSWORD || "parent123" },
      admin: { email: process.env.ADMIN_EMAIL || "admin@eduai.com", password: process.env.ADMIN_PASSWORD || "admin123" }
    }
  });
};

module.exports = { register, login, me, getDevCredentials };
