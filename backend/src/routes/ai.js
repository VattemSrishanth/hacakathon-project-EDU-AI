const express = require("express");
const { ask, explainVideo, analyzeImage, analyzePdf } = require("../controllers/aiController");

const router = express.Router();

router.post("/ask", ask);
router.post("/explain-video", explainVideo);
router.post("/analyze-image", analyzeImage);
router.post("/analyze-pdf", analyzePdf);

module.exports = router;
