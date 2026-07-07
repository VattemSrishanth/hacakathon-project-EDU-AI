const express = require("express");
const { login, logout, getProgress, updateProgress } = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.get("/progress", auth, getProgress);
router.post("/progress", auth, updateProgress);
router.post("/logout", auth, logout);

module.exports = router;
