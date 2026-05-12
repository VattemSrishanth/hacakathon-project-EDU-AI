const express = require("express");
const { getEducationNews } = require("../controllers/newsController");

const router = express.Router();

router.get("/education-news", getEducationNews);

module.exports = router;
