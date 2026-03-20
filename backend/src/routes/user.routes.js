const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const {
  verifyUser,
  analyzeCow,
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

module.exports = router;
