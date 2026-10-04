const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    college: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: String, required: true },
    subjects: [{ type: String }],
    schedule: { type: mongoose.Schema.Types.Mixed, default: {} }, // AI generated JSON schedule
    studyPlan: { type: String, default: "" }, // AI generated Markdown recommendations
    reminders: [
      {
        title: { type: String, required: true },
        date: { type: Date, required: true },
        type: { type: String, enum: ["revision", "assignment", "exam"], default: "revision" }
      }
    ]
  },
  { timestamps: true }
);


module.exports = mongoose.model("Timetable", timetableSchema);
