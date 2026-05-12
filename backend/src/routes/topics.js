const express = require("express");
const { listTopics } = require("../controllers/topicController");

const router = express.Router();

router.get("/", listTopics);

module.exports = router;
