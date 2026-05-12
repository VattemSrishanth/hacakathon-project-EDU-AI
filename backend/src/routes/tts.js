const express = require("express");
const { tts } = require("../controllers/ttsController");

const router = express.Router();

router.post("/tts", tts);

module.exports = router;
