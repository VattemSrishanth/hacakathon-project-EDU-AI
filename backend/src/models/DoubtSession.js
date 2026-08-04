const mongoose = require("mongoose");

const doubtSessionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { 
      type: String, 
      enum: ["matching", "active", "completed", "expired", "cancelled"], 
      default: "matching" 
    },
    subject: { type: String, required: true },
    topic: { type: String, default: "" },
    language: { type: String, default: "English" },
    grade: { type: String, default: "Class 10" },
    difficulty: { type: String, default: "Medium" },
    questionText: { type: String, required: true },
    declinedTeacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startTime: { type: Date },
    endTime: { type: Date },
    rating: { type: Number },
    feedback: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoubtSession", doubtSessionSchema);
