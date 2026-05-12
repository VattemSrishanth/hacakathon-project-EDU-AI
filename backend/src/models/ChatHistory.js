const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    session_id: { type: String, default: "default" },
    messages: { type: Array, default: [] }
  },
  { timestamps: true }
);

chatHistorySchema.index({ user_id: 1, session_id: 1 }, { unique: true });

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
