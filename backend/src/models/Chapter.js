const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    board_id: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    chapter_no: { type: Number, required: true },
    chapter_name: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

chapterSchema.index({ board_id: 1, class_id: 1, subject_id: 1, chapter_no: 1 }, { unique: true });
chapterSchema.index({ chapter_name: "text" });

module.exports = mongoose.model("Chapter", chapterSchema);
