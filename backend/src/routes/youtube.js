const express = require("express");
const { searchVideo, getCaptions, getDictionary } = require("../controllers/youtubeController");

const router = express.Router();

router.get("/youtube-search", searchVideo);
router.get("/youtube-captions", getCaptions);
router.get("/isl-dictionary", getDictionary);

module.exports = router;
