const asyncHandler = require("../utils/asyncHandler");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const Topic = require("../models/Topic");
const { cache, getCacheKey } = require("../services/cache");

const searchAll = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) {
    return res.status(400).json({ error: "q query param is required" });
  }

  const cacheKey = getCacheKey("search", { q });
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const regex = new RegExp(q, "i");

  const [subjects, chapters, topics] = await Promise.all([
    Subject.find({ name: regex }).limit(20).lean(),
    Chapter.find({ chapter_name: regex })
      .limit(20)
      .populate("class_id", "class_no name")
      .populate("subject_id", "name")
      .lean(),
    Topic.find({ topic_name: regex })
      .limit(50)
      .populate({
        path: "chapter_id",
        populate: [
          { path: "class_id", select: "class_no name" },
          { path: "subject_id", select: "name" }
        ]
      })
      .lean()
  ]);

  const payload = { subjects, chapters, topics };
  cache.set(cacheKey, payload);
  return res.json(payload);
});

module.exports = { searchAll };
