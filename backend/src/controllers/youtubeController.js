const asyncHandler = require("../utils/asyncHandler");

const searchVideo = asyncHandler(async (req, res) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const q = (req.query.q || "").trim();

  if (!q) {
    return res.status(400).json({ error: "q is required" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "YOUTUBE_API_KEY is missing" });
  }

  const params = new URLSearchParams({
    part: "snippet",
    maxResults: "1",
    type: "video",
    q,
    key: apiKey
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    return res.status(response.status).json({ error: text });
  }

  const data = await response.json();
  const item = data.items?.[0];
  const videoId = item?.id?.videoId;

  if (!videoId) {
    return res.status(404).json({ error: "No video found" });
  }

  return res.json({ videoId });
});

const getCaptions = asyncHandler(async (req, res) => {
  const videoId = (req.query.videoId || "").trim();
  if (!videoId) {
    return res.status(400).json({ error: "videoId is required" });
  }

  return res.json({ transcript: "Captions not available." });
});

module.exports = { searchVideo, getCaptions };
