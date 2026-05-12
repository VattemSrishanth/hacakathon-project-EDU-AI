const express = require("express");
const { getBoardSyllabus } = require("../controllers/syllabusController");

const router = express.Router();

router.get("/board/:board", getBoardSyllabus);

module.exports = router;
