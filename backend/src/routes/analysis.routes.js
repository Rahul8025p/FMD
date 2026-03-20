const express = require("express");
const router = express.Router();

const { analyzeCow } = require("../controllers/analysis.controller");

router.post("/analyze", analyzeCow);

module.exports = router;
