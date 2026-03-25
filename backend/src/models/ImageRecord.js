const mongoose = require("mongoose");

const ImageRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    cow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cow",
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },

    // Denormalized RFID for reliable history display/search.
    rfidTag: {
      type: String,
      trim: true
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
      required: true,
    },

    fever: {
      type: Boolean,
      required: true,
    },

    temperature: {
      type: Number,
      required: function () {
        return this.fever === true;
      },
    },

    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    prediction: {
      type: String,
      trim: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    severity: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImageRecord", ImageRecordSchema);
