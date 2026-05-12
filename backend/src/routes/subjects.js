const express = require("express");
const { listSubjects } = require("../controllers/subjectController");

const router = express.Router();

router.get("/", listSubjects);

module.exports = router;
