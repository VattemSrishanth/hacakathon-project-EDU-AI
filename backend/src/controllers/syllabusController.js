const fs = require("fs");
const path = require("path");
const asyncHandler = require("../utils/asyncHandler");
const { cache, getCacheKey } = require("../services/cache");

const getBoardSyllabus = asyncHandler(async (req, res) => {
  const board = (req.params.board || "NCERT").toLowerCase();
  const cacheKey = getCacheKey("syllabus", { board });
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "syllabus",
    `${board}_syllabus.json`
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Syllabus not found" });
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  const payload = { success: true, syllabus: data };
  cache.set(cacheKey, payload);
  return res.json(payload);
});

module.exports = { getBoardSyllabus };
