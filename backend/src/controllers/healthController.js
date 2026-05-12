const asyncHandler = require("../utils/asyncHandler");

const healthCheck = asyncHandler(async (req, res) => {
  return res.json({ success: true, status: "ok" });
});

module.exports = { healthCheck };
