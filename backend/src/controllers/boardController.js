const asyncHandler = require("../utils/asyncHandler");
const Board = require("../models/Board");
const { cache, getCacheKey } = require("../services/cache");

const listBoards = asyncHandler(async (req, res) => {
  const cacheKey = getCacheKey("boards", null);
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const boards = await Board.find({}).sort({ name: 1 }).lean();
  cache.set(cacheKey, boards);
  return res.json(boards);
});

module.exports = { listBoards };
