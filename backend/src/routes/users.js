const express = require("express");
const { login, getProgress, updateProgress } = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.get("/progress", auth, getProgress);
router.post("/progress", auth, updateProgress);

module.exports = router;
