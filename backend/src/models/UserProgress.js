const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    progress: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProgress", userProgressSchema);
