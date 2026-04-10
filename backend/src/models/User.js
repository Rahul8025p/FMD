const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER"
    },

    phone: String,

    address: {
      village: String,
      district: String,
      state: String
    },

    lastLogin: Date,
    languagePreference: {
      type: String,
      enum: ["en", "hi", "te"],
      default: "en"
    },
    languageRegion: {
      type: String,
      default: null
    },
    languageCountryCode: {
      type: String,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
