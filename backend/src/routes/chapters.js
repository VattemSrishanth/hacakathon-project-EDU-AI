const express = require("express");
const { listChapters } = require("../controllers/chapterController");

const router = express.Router();

router.get("/", listChapters);

module.exports = router;
