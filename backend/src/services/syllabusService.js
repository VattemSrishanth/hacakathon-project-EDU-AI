const Board = require("../models/Board");
const ClassModel = require("../models/Class");
const Subject = require("../models/Subject");

const getBoardByName = async (boardName) => {
  const name = boardName || "NCERT";
  return Board.findOne({ name }).lean();
};

const getClassByNumber = async (classNo, boardId) => {
  if (!classNo) return null;
  return ClassModel.findOne({ class_no: Number(classNo), board_id: boardId }).lean();
};

const getSubjectByName = async (subjectName, boardId) => {
  if (!subjectName) return null;
  return Subject.findOne({ name: subjectName, board_id: boardId }).lean();
};

module.exports = {
  getBoardByName,
  getClassByNumber,
  getSubjectByName
};
