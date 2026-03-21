const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { getAdminOverview } = require("../controllers/admin.controller");

router.get(
  "/overview",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAdminOverview
);

module.exports = router;
