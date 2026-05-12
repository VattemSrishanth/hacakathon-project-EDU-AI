const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user_id: { type: String, default: null },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
