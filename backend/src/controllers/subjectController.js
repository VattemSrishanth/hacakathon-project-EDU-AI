const asyncHandler = require("../utils/asyncHandler");
const Board = require("../models/Board");
const Chapter = require("../models/Chapter");
const Subject = require("../models/Subject");
const ClassModel = require("../models/Class");
const { cache, getCacheKey } = require("../services/cache");

const listSubjects = asyncHandler(async (req, res) => {
  const classNo = req.query.class;
  const boardName = req.query.board || "NCERT";
  if (!classNo) {
    return res.status(400).json({ error: "class query param is required" });
  }

  const cacheKey = getCacheKey("subjects", { classNo, boardName });
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const board = await Board.findOne({ name: boardName }).lean();
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  const classDoc = await ClassModel.findOne({ class_no: Number(classNo), board_id: board._id }).lean();
  if (!classDoc) {
    return res.status(404).json({ error: "Class not found" });
  }

  const subjectIds = await Chapter.distinct("subject_id", {
    board_id: board._id,
    class_id: classDoc._id
  });

  const subjects = await Subject.find({ _id: { $in: subjectIds } })
    .sort({ name: 1 })
    .lean();

  cache.set(cacheKey, subjects);
  return res.json(subjects);
});

module.exports = { listSubjects };
