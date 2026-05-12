const asyncHandler = require("../utils/asyncHandler");

const listDoubts = asyncHandler(async (req, res) => {
  return res.json({ success: true, doubts: [] });
});

module.exports = { listDoubts };
