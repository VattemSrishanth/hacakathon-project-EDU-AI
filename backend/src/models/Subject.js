const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["core", "language", "social_sub", "elective"],
      default: "core"
    },
    board_id: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true }
  },
  { timestamps: true }
);

subjectSchema.index({ board_id: 1, name: 1 }, { unique: true });
subjectSchema.index({ name: "text" });

module.exports = mongoose.model("Subject", subjectSchema);
