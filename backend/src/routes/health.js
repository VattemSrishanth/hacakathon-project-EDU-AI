const express = require("express");
const { healthCheck, pingCheck } = require("../controllers/healthController");

const router = express.Router();

router.get("/health", healthCheck);
router.get("/health/ping", pingCheck);
router.get("/ping", pingCheck);

module.exports = router;
