const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const {
  verifyUser,
  analyzeCow,
  getHistory,
  updateLanguagePreference,
  autoDetectLanguage
} = require("../controllers/user.controller");

/* 🔐 Verify user */
router.get(
  "/home",
  authMiddleware,
  roleMiddleware("USER"),
  verifyUser
);

/* 🐄 Upload + analyze metadata */
router.post(
  "/analyze",
  authMiddleware,
  roleMiddleware("USER"),
  upload.single("image"),
  analyzeCow
);

router.get(
  "/history",
  authMiddleware,
  roleMiddleware("USER"),
  getHistory
);

router.patch(
  "/language",
  authMiddleware,
  roleMiddleware("USER"),
  updateLanguagePreference
);

router.post(
  "/language/auto-detect",
  authMiddleware,
  roleMiddleware("USER"),
  autoDetectLanguage
);

module.exports = router;
