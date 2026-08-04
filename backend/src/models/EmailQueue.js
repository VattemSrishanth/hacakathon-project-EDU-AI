const mongoose = require("mongoose");

const emailQueueSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    scheduledFor: { type: Date, default: Date.now },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailQueue", emailQueueSchema);
