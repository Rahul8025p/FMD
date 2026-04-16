const express = require("express");

const { translateRuntimeContent } = require("../controllers/translation.controller");

const router = express.Router();

router.post("/runtime", translateRuntimeContent);

module.exports = router;
