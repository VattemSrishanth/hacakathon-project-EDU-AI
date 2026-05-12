const asyncHandler = require("../utils/asyncHandler");
const Chapter = require("../models/Chapter");
const { getBoardByName, getClassByNumber, getSubjectByName } = require("../services/syllabusService");
const { cache, getCacheKey } = require("../services/cache");

const listChapters = asyncHandler(async (req, res) => {
  const classNo = req.query.class;
  const subjectName = req.query.subject;
  const boardName = req.query.board || "NCERT";

  if (!classNo || !subjectName) {
    return res.status(400).json({ error: "class and subject query params are required" });
  }

  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);

  const cacheKey = getCacheKey("chapters", { classNo, subjectName, boardName, page, limit });
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const board = await getBoardByName(boardName);
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  const classDoc = await getClassByNumber(classNo, board._id);
  if (!classDoc) {
    return res.status(404).json({ error: "Class not found" });
  }

  const subjectDoc = await getSubjectByName(subjectName, board._id);
  if (!subjectDoc) {
    return res.status(404).json({ error: "Subject not found" });
  }

  const query = {
    board_id: board._id,
    class_id: classDoc._id,
    subject_id: subjectDoc._id
  };

  const total = await Chapter.countDocuments(query);
  const chapters = await Chapter.find(query)
    .sort({ chapter_no: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const payload = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: chapters
  };

  cache.set(cacheKey, payload);
  return res.json(payload);
});

module.exports = { listChapters };
