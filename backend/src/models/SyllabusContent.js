const mongoose = require("mongoose");

const syllabusContentSchema = new mongoose.Schema(
  {
    board: { type: String, required: true, trim: true },
    class_level: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    pdf_data_url: { type: String, default: "" }
  },
  { timestamps: true }
);

syllabusContentSchema.index(
  { board: 1, class_level: 1, subject: 1, topic: 1 },
  { unique: true }
);

module.exports = mongoose.model("SyllabusContent", syllabusContentSchema);
