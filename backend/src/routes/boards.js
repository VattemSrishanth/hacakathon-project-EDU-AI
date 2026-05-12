const express = require("express");
const { listBoards } = require("../controllers/boardController");

const router = express.Router();

router.get("/", listBoards);

module.exports = router;
