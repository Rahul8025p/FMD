const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");

const { analyzeCow } = require("../controllers/analysis.controller");

router.post("/analyze", upload.single("image"), analyzeCow);

module.exports = router;
