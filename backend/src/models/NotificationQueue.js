const mongoose = require("mongoose");

const notificationQueueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["push", "email", "in_app"], default: "in_app" },
    audience: {
      role: { type: String, default: "all" }, // all, student, teacher, admin
      colleges: [{ type: String }],
      branches: [{ type: String }],
      semesters: [{ type: String }]
    },
    scheduleType: { type: String, enum: ["immediate", "future", "recurring"], default: "immediate" },
    scheduledTime: { type: Date, default: Date.now },
    sent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationQueue", notificationQueueSchema);
