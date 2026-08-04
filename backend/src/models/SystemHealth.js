const mongoose = require("mongoose");

const systemHealthSchema = new mongoose.Schema(
  {
    mongodb: { type: String, default: "connected" },
    redis: { type: String, default: "connected" },
    emailServer: { type: String, default: "connected" },
    socketServer: { type: String, default: "connected" },
    videoServer: { type: String, default: "connected" },
    cpuUsage: { type: Number, default: 0 },
    memoryUsage: { type: Number, default: 0 },
    storageUsage: { type: Number, default: 0 },
    apiResponseTime: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemHealth", systemHealthSchema);
