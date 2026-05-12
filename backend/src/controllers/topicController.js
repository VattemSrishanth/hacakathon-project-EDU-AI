const asyncHandler = require("../utils/asyncHandler");
const Topic = require("../models/Topic");
const { cache, getCacheKey } = require("../services/cache");

const listTopics = asyncHandler(async (req, res) => {
  const chapterId = req.query.chapter_id;
  if (!chapterId) {
    return res.status(400).json({ error: "chapter_id query param is required" });
  }

  const cacheKey = getCacheKey("topics", { chapterId });
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const topics = await Topic.find({ chapter_id: chapterId })
    .sort({ topic_name: 1 })
    .lean();

  cache.set(cacheKey, topics);
  return res.json(topics);
});

module.exports = { listTopics };
