const asyncHandler = require("../utils/asyncHandler");
const Chapter = require("../models/Chapter");
const { getBoardByName, getClassByNumber, getSubjectByName } = require("../services/syllabusService");

const nextChapter = asyncHandler(async (req, res) => {
  const classNo = req.query.class;
  const subjectName = req.query.subject;
  const boardName = req.query.board || "NCERT";
  const current = Number(req.query.current || 0);

  if (!classNo || !subjectName) {
    return res.status(400).json({ error: "class and subject query params are required" });
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

  const chapter = await Chapter.findOne({
    board_id: board._id,
    class_id: classDoc._id,
    subject_id: subjectDoc._id,
    chapter_no: { $gt: current }
  })
    .sort({ chapter_no: 1 })
    .lean();

  return res.json({ next: chapter || null });
});

const learningPath = asyncHandler(async (req, res) => {
  const classNo = req.query.class;
  const subjectName = req.query.subject;
  const boardName = req.query.board || "NCERT";

  if (!classNo || !subjectName) {
    return res.status(400).json({ error: "class and subject query params are required" });
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

  const chapters = await Chapter.find({
    board_id: board._id,
    class_id: classDoc._id,
    subject_id: subjectDoc._id
  })
    .sort({ chapter_no: 1 })
    .lean();

  return res.json({ data: chapters });
});

module.exports = { nextChapter, learningPath };
