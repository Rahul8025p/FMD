require("dotenv").config();
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");

const ADMIN_EMAIL = "Admin@gmail.com";
const ADMIN_PASSWORD = "Admin@2005";
const ADMIN_NAME = "Admin";

async function seedAdmin() {
  try {
    await connectDB();

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      existing.name = ADMIN_NAME;
      existing.role = "ADMIN";
      existing.passwordHash = passwordHash;
      await existing.save();
      console.log("Admin user already existed. Updated role/password successfully.");
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: "ADMIN"
      });
      console.log("Admin user created successfully.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin user:", err.message);
    process.exit(1);
  }
}

seedAdmin();

