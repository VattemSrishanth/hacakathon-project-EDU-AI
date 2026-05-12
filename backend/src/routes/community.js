const express = require("express");
const { listDoubts } = require("../controllers/communityController");

const router = express.Router();

router.get("/community/doubts", listDoubts);

module.exports = router;
