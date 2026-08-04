const mongoose = require("mongoose");

const moderationLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messageContent: { type: String, default: "" },
    infractionType: { type: String, required: true },
    actionTaken: { type: String, required: true }, // e.g. "warned", "muted_24h", "suspended_7d", "banned"
  },
  { timestamps: true }
);

moderationLogSchema.index({ userId: 1 });

module.exports = mongoose.model("ModerationLog", moderationLogSchema);
