const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "General", trim: true },
    level: { type: String, default: "Beginner", trim: true },
    subject: { type: String, default: "", trim: true },
    board: { type: String, default: "NCERT", trim: true },
    class_level: { type: String, default: "", trim: true },
    status: { type: String, default: "published", trim: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
