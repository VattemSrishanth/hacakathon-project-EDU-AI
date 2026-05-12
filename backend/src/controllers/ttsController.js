const asyncHandler = require("../utils/asyncHandler");

const tts = asyncHandler(async (req, res) => {
  const emptyAudio = Buffer.from("");
  res.setHeader("Content-Type", "audio/mpeg");
  return res.status(200).send(emptyAudio);
});

module.exports = { tts };
