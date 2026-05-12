const asyncHandler = require("../utils/asyncHandler");
const SyllabusContent = require("../models/SyllabusContent");

const getContent = asyncHandler(async (req, res) => {
  const { board, class_level, subject, topic } = req.query;
  if (!board || !class_level || !subject || !topic) {
    return res
      .status(400)
      .json({ success: false, error: "board, class_level, subject, topic are required" });
  }

  const content = await SyllabusContent.findOne({ board, class_level, subject, topic }).lean();
  return res.json({ success: true, content });
});

module.exports = { getContent };
