const express = require("express");
const { listClasses } = require("../controllers/classController");

const router = express.Router();

router.get("/", listClasses);

module.exports = router;
