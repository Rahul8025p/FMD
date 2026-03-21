const Cow = require("../models/cow");
const ImageRecord = require("../models/ImageRecord");
const { inferWithML } = require("../services/inference.service");
const { getMockRecommendations } = require("../services/recommendation.service");

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

    // ✅ Validate required fields
    if (!rfid || !req.file) {
      return res.status(400).json({
        message: "RFID and image are required",
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    /* 🐄 Find or create cow */
    let cow = await Cow.findOne({ rfidTag: rfid });

    if (!cow) {
      cow = await Cow.create({
        rfidTag: rfid,
        owner: req.user?.id,
        breed,
        age,
        location: {
          type: "Point",
          coordinates: [
            Number(longitude) || 0,
            Number(latitude) || 0,
          ],
        },
      });
    }

    const inference = await inferWithML(req.file.path);
    const rawDisease = (inference?.disease || "").toLowerCase();
    const disease = rawDisease.includes("mouth")
      ? "FMD"
      : rawDisease.includes("healthy")
        ? "Healthy"
        : "Other";
    const confidence = Number(inference?.confidence || 0);
    const severity = inference?.severity || "Low";

    const result = {
      disease,
      confidence,
      severity,
      explanation: {
        visual:
          disease === "FMD"
            ? [
                "Detected visible lesion-like patterns near hoof/mouth areas",
                "Inflammation markers are present in key regions"
              ]
            : ["No significant abnormal visual lesions detected"],
        texture:
          disease === "FMD"
            ? ["Abnormal surface texture compared to healthy samples"]
            : ["Texture patterns are close to healthy baseline"],
        thermal:
          fever === "Yes"
            ? ["User-reported fever supports possible active infection"]
            : ["No fever indicator reported in metadata"]
      },
      recommendations: getMockRecommendations()
    };

    /* 🖼 Save image metadata */
    const imageRecord = await ImageRecord.create({
      user: req.user?.id,
      cow: cow._id,
      imageUrl,
      breed,
      age,
      sex,
      fever: fever === "Yes",
      temperature:
        fever === "Yes" && temperature
          ? Number(temperature)
          : undefined,
      location: {
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
      },
      prediction: disease,
      confidence,
      severity
    });

    return res.status(201).json({
      message: "Image uploaded and analyzed successfully",
      cowId: cow._id,
      imageRecordId: imageRecord._id,
      imageUrl,
      result,
      inferenceSource: inference.source
    });

  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({
      message: "Failed to process cattle data",
    });
  }
};