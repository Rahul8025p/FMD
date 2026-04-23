const User = require("../models/User");
const Cow = require("../models/cow");
const ImageRecord = require("../models/ImageRecord");
const mongoose = require("mongoose");
const { inferWithML } = require("../services/inference.service");
const {
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  detectLanguageFromCoordinates
} = require("../services/language.service");

function buildDynamicExplanation({ disease, fever, confidence, severity }) {
  const visual = [];
  const texture = [];
  const thermal = [];

  if (disease === "FMD") {
    visual.push("Visible lesion-like patterns were detected around mouth/hoof regions.");
    visual.push("Inflammation hotspots appear in key symptom zones.");
    texture.push("Surface texture differs from healthy baseline samples.");
    texture.push(
      confidence >= 0.85
        ? "Pattern confidence is high based on model similarity."
        : "Pattern confidence is moderate; monitor with follow-up scan."
    );
  } else if (disease === "Healthy") {
    visual.push("No lesion-like visual markers were detected in major risk regions.");
    texture.push("Texture profile remains close to healthy baseline.");
  } else {
    visual.push("The model found mixed visual signals that are not class-specific.");
    texture.push("Texture variation is present but not strongly diagnostic.");
  }

  if (fever === true) {
    thermal.push("Recorded fever metadata supports possible active infection.");
  } else if (fever === false) {
    thermal.push("No fever metadata was reported for this scan.");
  } else {
    thermal.push("Thermal/fever metadata was unavailable for this record.");
  }

  thermal.push(`Severity estimate: ${severity || "Unknown"}.`);

  return { visual, texture, thermal };
}

function buildDynamicRecommendations({ disease, severity, fever }) {
  const level = String(severity || "").toLowerCase();
  const precautions = [];
  const treatment = [];
  let vaccination = "Follow local veterinary vaccination schedule.";

  if (disease === "FMD") {
    precautions.push("Isolate the affected cattle from healthy animals immediately.");
    precautions.push("Sanitize feeding/watering areas and common contact surfaces daily.");
    precautions.push("Limit animal movement until veterinary clearance.");
    treatment.push("Consult a veterinary officer for a targeted FMD treatment plan.");
    treatment.push("Provide hydration and supportive feed to reduce stress.");
    treatment.push("Track temperature and lesions daily for progression.");
    vaccination = "FMD booster/vaccination is strongly recommended for nearby cattle.";

    if (level === "high" || level === "severe" || level === "critical") {
      precautions.push("Create a temporary farm-level containment zone around this case.");
      treatment.push("Prioritize urgent veterinary review within 24 hours.");
    }
  } else if (disease === "Healthy") {
    precautions.push("Maintain routine hygiene and periodic livestock screening.");
    precautions.push("Continue separating new cattle until observation is complete.");
    treatment.push("No immediate disease treatment required.");
    treatment.push("Keep regular nutrition and preventive care schedule.");
    vaccination = "Maintain periodic preventive FMD vaccination as advised locally.";
  } else {
    precautions.push("Monitor symptoms and avoid mixing with high-risk groups.");
    precautions.push("Repeat scan with clear image and stable lighting.");
    treatment.push("Seek veterinary guidance for differential diagnosis.");
    treatment.push("Capture additional clinical signs for follow-up.");
  }

  if (fever === true && disease !== "Healthy") {
    treatment.push("Use veterinarian-approved fever management protocol.");
  }

  return { precautions, treatment, vaccination };
}

function serializeResultPayload(record) {
  const disease = record?.prediction || "Other";
  const confidence = Number(record?.confidence || 0);
  const severity = record?.severity || (disease === "FMD" ? "Moderate" : "Low");
  const fever = record?.fever;

  return {
    disease,
    confidence,
    severity,
    explanation: buildDynamicExplanation({ disease, fever, confidence, severity }),
    recommendations: buildDynamicRecommendations({ disease, severity, fever }),
    location: {
      latitude: Number(record?.location?.latitude),
      longitude: Number(record?.location?.longitude)
    },
    metadata: {
      rfidTag: record?.rfidTag || "",
      breed: record?.breed || "",
      age: record?.age,
      sex: record?.sex || "",
      fever
    }
  };
}

exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-passwordHash"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User verified",
      user
    });
  } catch (err) {
    res.status(500).json({
      message: "Verification failed"
    });
  }
};

exports.analyzeCow = async (req, res) => {
  try {
    const {
      rfid,
      breed,
      age,
      sex,
      fever,
      temperature,
      latitude,
      longitude,
    } = req.body;

    if (!rfid || !req.file) {
      return res.status(400).json({
        message: "RFID and image are required",
      });
    }

    /* 🐄 Find or create cow */
    let cow = await Cow.findOne({ rfidTag: rfid });

    if (!cow) {
      cow = await Cow.create({
        rfidTag: rfid,
        owner: req.user.id,
        breed,
        age,
        location: {
          type: "Point",
          coordinates: [
            Number(longitude),
            Number(latitude),
          ],
        },
      });
    }

    const imagePath = req.file.path;
    const inference = await inferWithML(imagePath);
    const rawDisease = (inference?.disease || "").toLowerCase();
    const disease = rawDisease.includes("mouth")
      ? "FMD"
      : rawDisease.includes("healthy")
        ? "Healthy"
        : "Other";

    const confidence = Number(inference?.confidence || 0);
    const severity =
      inference?.severity || (disease === "FMD" ? "Moderate" : "Low");

    /* 🖼 Save image metadata + summary inference for history */
    const imageRecord = await ImageRecord.create({
      user: req.user.id,
      cow: cow._id,
      imageUrl: `/uploads/${req.file.filename}`,
      rfidTag: rfid,
      breed,
      age,
      sex,
      fever: fever === "Yes",
      temperature: fever === "Yes" ? Number(temperature) : undefined,
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      prediction: disease,
      confidence,
      severity
    });
    const result = serializeResultPayload(imageRecord);

    return res.status(201).json({
      message: "Image uploaded and analyzed successfully",
      cowId: cow._id,
      imageRecordId: imageRecord._id,
      result,
      imageUrl: `/uploads/${req.file.filename}`,
      inferenceSource: inference.source
    });

  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({
      message: "Failed to process cattle data",
    });
  }
};

exports.getResultById = async (req, res) => {
  try {
    const { imageRecordId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(imageRecordId)) {
      return res.status(400).json({ message: "Invalid result ID" });
    }

    const record = await ImageRecord.findOne({
      _id: imageRecordId,
      user: req.user.id
    })
      .select("imageUrl prediction confidence severity createdAt fever temperature location rfidTag breed age sex")
      .lean();

    if (!record) {
      return res.status(404).json({ message: "Result not found" });
    }

    return res.status(200).json({
      success: true,
      imageRecordId: record._id,
      imageUrl: record.imageUrl,
      createdAt: record.createdAt,
      result: serializeResultPayload(record)
    });
  } catch (err) {
    console.error("Result fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch result" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const records = await ImageRecord.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "imageUrl prediction confidence severity createdAt fever temperature location rfidTag breed age sex"
      )
      .lean();

    return res.status(200).json({
      success: true,
      count: records.length,
      history: records
    });
  } catch (err) {
    console.error("History fetch error:", err);
    return res.status(500).json({
      message: "Failed to fetch history"
    });
  }
};

exports.updateLanguagePreference = async (req, res) => {
  try {
    const language = normalizeLanguage(req.body?.language);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.languagePreference = language;
    await user.save();

    return res.status(200).json({
      success: true,
      language,
      supportedLanguages: SUPPORTED_LANGUAGES
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update language preference"
    });
  }
};

exports.autoDetectLanguage = async (req, res) => {
  try {
    const { latitude, longitude } = req.body || {};
    const detection = await detectLanguageFromCoordinates(latitude, longitude);
    const language = normalizeLanguage(detection.language);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.languagePreference = language;
    user.languageCountryCode = detection.countryCode;
    user.languageRegion = detection.region;
    await user.save();

    return res.status(200).json({
      success: true,
      language,
      region: detection.region,
      countryCode: detection.countryCode,
      supportedLanguages: SUPPORTED_LANGUAGES
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to auto-detect language"
    });
  }
};

// exports.analyzeCow = async (req, res) => {
//   try {
//     const {
//       rfid,
//       breed,
//       age,
//       sex,
//       fever,
//       temperature,
//       latitude,
//       longitude,
//     } = req.body;

//     if (!rfid || !req.file) {
//       return res.status(400).json({
//         message: "RFID and image are required",
//       });
//     }

//     /* 🐄 Find or create cow */
//     let cow = await Cow.findOne({ rfidTag: rfid });

//     if (!cow) {
//       cow = await Cow.create({
//         rfidTag: rfid,
//         owner: req.user.id,
//         breed,
//         age,
//         location: {
//           type: "Point",
//           coordinates: [
//             Number(longitude),
//             Number(latitude),
//           ],
//         },
//       });
//     }

//     /* ---------- CALL ML SERVICE ---------- */
//     const imagePath = path.join(__dirname, "..", "uploads", req.file.filename);

//     const form = new FormData();
//     form.append("file", fs.createReadStream(imagePath));

//     const mlResponse = await axios.post(
//       "http://localhost:8000/predict",
//       form,
//       {
//         headers: form.getHeaders(),
//       }
//     );

//     const { disease, confidence } = mlResponse.data;

//     /* 🖼 Save image metadata + prediction */
//     const imageRecord = await ImageRecord.create({
//       user: req.user.id,
//       cow: cow._id,
//       imageUrl: `/uploads/${req.file.filename}`,
//       breed,
//       age,
//       sex,
//       fever: fever === "Yes",
//       temperature: fever === "Yes" ? Number(temperature) : undefined,
//       location: {
//         latitude: Number(latitude),
//         longitude: Number(longitude),
//       },
//       prediction: disease,
//       confidence,
//     });

//     return res.status(201).json({
//       message: "Image uploaded and analyzed",
//       cowId: cow._id,
//       imageRecordId: imageRecord._id,
//       prediction: disease,
//       confidence,
//     });

//   } catch (err) {
//     console.error("Analyze error:", err);
//     return res.status(500).json({
//       message: "Failed to process cattle data",
//     });
//   }
// };