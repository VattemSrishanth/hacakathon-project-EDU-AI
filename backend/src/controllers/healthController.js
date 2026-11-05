const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d > 0 ? d + "d " : ""}${h > 0 ? h + "h " : ""}${m}m ${s}s`;
};

const healthCheck = asyncHandler(async (req, res) => {
  const memory = process.memoryUsage();
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  return res.json({
    success: true,
    status: "ok",
    service: "edu-ai-backend",
    version: "2.1.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(process.uptime()),
      humanReadable: formatUptime(process.uptime())
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024))
      }
    },
    database: {
      status: dbStatusMap[mongoose.connection.readyState] || "unknown",
      readyState: mongoose.connection.readyState
    }
  });
});

const pingCheck = asyncHandler(async (req, res) => {
  return res.json({
    success: true,
    message: "pong",
    timestamp: Date.now()
  });
});

module.exports = { healthCheck, pingCheck };
