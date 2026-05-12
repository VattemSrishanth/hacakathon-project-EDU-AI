const path = require("path");
const { spawn } = require("child_process");
const asyncHandler = require("../utils/asyncHandler");

const getEducationNews = asyncHandler(async (req, res) => {
  const scriptPath = path.join(__dirname, "..", "..", "news_service.js");

  const proc = spawn(process.execPath, [scriptPath], { timeout: 15000 });
  let output = "";

  proc.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });

  proc.stderr.on("data", () => {
    // ignore stderr from rss
  });

  proc.on("close", () => {
    try {
      const items = JSON.parse(output || "[]");
      return res.json({ success: true, news: items });
    } catch {
      return res.json({ success: true, news: [] });
    }
  });
});

module.exports = { getEducationNews };
