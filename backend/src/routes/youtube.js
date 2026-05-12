const express = require("express");
const { searchVideo, getCaptions } = require("../controllers/youtubeController");

const router = express.Router();

router.get("/youtube-search", searchVideo);
router.get("/youtube-captions", getCaptions);

module.exports = router;
