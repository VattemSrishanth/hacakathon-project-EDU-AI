const mongoose = require("mongoose");

const teacherVerificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    profilePhoto: { type: String, default: "" },
    governmentId: { type: String, default: "" },
    degreeUrl: { type: String, default: "" },
    certificates: [{ type: String }],
    experience: { type: Number, default: 0 },
    subjects: [{ type: String }],
    languages: [{ type: String }],
    teachingLevels: [{ type: String }],
    resumeUrl: { type: String, default: "" },
    videoIntroUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "more_documents_requested"],
      default: "pending"
    },
    feedback: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeacherVerification", teacherVerificationSchema);
