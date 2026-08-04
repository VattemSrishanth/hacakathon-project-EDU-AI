const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, default: "", trim: true },
    avatar_url: { type: String, default: "", trim: true },
    role: { type: String, default: "student", trim: true },
    password_hash: { type: String, default: "" },
    warning_count: { type: Number, default: 0 },
    ban_expires_at: { type: Date, default: null },
    is_permanently_banned: { type: Boolean, default: false },
    last_opened: {
      class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
      subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }
    },
    completed_chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
