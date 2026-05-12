require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDb = require("../src/config/db");
const Board = require("../src/models/Board");
const ClassModel = require("../src/models/Class");
const Subject = require("../src/models/Subject");
const Chapter = require("../src/models/Chapter");
const Topic = require("../src/models/Topic");

const syllabusPath = path.join(
  __dirname,
  "..",
  "data",
  "syllabus",
  "ncert_syllabus.json"
);

const languageSubjects = new Set([
  "English",
  "Hindi",
  "Sanskrit",
  "Urdu",
  "Telugu",
  "Tamil"
]);
const socialSubjects = new Set([
  "Social Science",
  "Social Studies",
  "History",
  "Geography",
  "Civics",
  "Economics",
  "Political Science"
]);
const electiveSubjects = new Set(["Computer", "Information Technology", "ICT"]);

const getSubjectType = (name) => {
  if (languageSubjects.has(name)) return "language";
  if (socialSubjects.has(name)) return "social_sub";
  if (electiveSubjects.has(name)) return "elective";
  return "core";
};

const parseUnit = (unit, fallbackNo) => {
  const match = unit.match(/^(Chapter|Unit)\s+(\d+)\s*:\s*(.+)$/i);
  if (match) {
    return {
      chapter_no: Number(match[2]),
      chapter_name: match[3].trim()
    };
  }

  return {
    chapter_no: fallbackNo,
    chapter_name: unit
  };
};

const seed = async () => {
  await connectDb();

  const raw = fs.readFileSync(syllabusPath, "utf8");
  const data = JSON.parse(raw);

  await Topic.deleteMany({});
  await Chapter.deleteMany({});
  await Subject.deleteMany({});
  await ClassModel.deleteMany({});
  await Board.deleteMany({});

  const boardName = data.board || "NCERT";
  const board = await Board.create({ name: boardName, code: boardName.toUpperCase() });

  const classEntries = Object.keys(data.classes || {}).sort((a, b) => Number(a) - Number(b));

  const subjectMap = new Map();

  for (const classNo of classEntries) {
    const classDoc = await ClassModel.create({
      class_no: Number(classNo),
      name: `Class ${classNo}`,
      board_id: board._id
    });

    const subjects = data.classes[classNo]?.subjects || {};
    for (const subjectName of Object.keys(subjects)) {
      let subjectDoc = subjectMap.get(subjectName);
      if (!subjectDoc) {
        subjectDoc = await Subject.create({
          name: subjectName,
          type: getSubjectType(subjectName),
          board_id: board._id
        });
        subjectMap.set(subjectName, subjectDoc);
      }

      const units = subjects[subjectName] || [];
      const chapterDocs = [];
      const topicDocs = [];
      const usedChapterNos = new Set();

      for (let index = 0; index < units.length; index += 1) {
        const unit = units[index];
        const parsed = parseUnit(unit.unit, index + 1);
        let chapterNo = parsed.chapter_no;
        while (usedChapterNos.has(chapterNo)) {
          chapterNo += 1;
        }
        usedChapterNos.add(chapterNo);
        const chapterName = parsed.chapter_name;
        const chapterId = new mongoose.Types.ObjectId();

        chapterDocs.push({
          _id: chapterId,
          board_id: board._id,
          class_id: classDoc._id,
          subject_id: subjectDoc._id,
          chapter_no: chapterNo,
          chapter_name: chapterName,
          unit: unit.unit
        });

        for (const topicName of unit.topics || []) {
          topicDocs.push({ chapter_id: chapterId, topic_name: topicName });
        }
      }

      if (chapterDocs.length) {
        await Chapter.insertMany(chapterDocs);
      }
      if (topicDocs.length) {
        await Topic.insertMany(topicDocs);
      }
    }
  }

  await mongoose.disconnect();
  console.log("Seed complete");
};

seed().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
