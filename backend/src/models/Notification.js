const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    type: { type: String, default: "system" },
    priority: { type: String, default: "normal" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
