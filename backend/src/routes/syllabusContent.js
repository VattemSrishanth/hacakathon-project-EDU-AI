const express = require("express");
const { getContent } = require("../controllers/syllabusContentController");

const router = express.Router();

router.get("/syllabus-content", getContent);

module.exports = router;
