const asyncHandler = require("../utils/asyncHandler");
const Board = require("../models/Board");
const ClassModel = require("../models/Class");
const { cache, getCacheKey } = require("../services/cache");

const listClasses = asyncHandler(async (req, res) => {
  const boardName = req.query.board || "NCERT";
  const cacheKey = getCacheKey("classes", { boardName });
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const board = await Board.findOne({ name: boardName }).lean();
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  const classes = await ClassModel.find({ board_id: board._id })
    .sort({ class_no: 1 })
    .lean();

  cache.set(cacheKey, classes);
  return res.json(classes);
});

module.exports = { listClasses };
