const express = require("express");
const { register, login, me, getDevCredentials } = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);
router.get("/dev-credentials", getDevCredentials);

module.exports = router;
