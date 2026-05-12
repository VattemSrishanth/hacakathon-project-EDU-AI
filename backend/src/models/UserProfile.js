const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);
