const mongoose = require("mongoose");

const CowSchema = new mongoose.Schema(
  {
    rfidTag: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    breed: {
      type: String,
      trim: true,
    },

    age: {
      type: Number,
      min: 0,
    },

    sex: {
      type: String,
      enum: ["Male", "Female"],
      default: "Female",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    healthStatus: {
      type: String,
      enum: ["Healthy", "Suspected", "Diseased", "Unknown"],
      default: "Unknown",
    },

    lastAnalyzedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🌍 Geospatial index
CowSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Cow", CowSchema);
