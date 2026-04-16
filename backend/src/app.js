const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const analysisRoutes = require("./routes/analysis.routes");
const adminRoutes = require("./routes/admin.routes");
const translationRoutes = require("./routes/translation.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analysisRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/translation", translationRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
