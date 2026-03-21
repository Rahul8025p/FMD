const User = require("../models/User");
const Cow = require("../models/cow");
const ImageRecord = require("../models/ImageRecord");
const { mockInference } = require("../services/inference.service");
const { getMockRecommendations } = require("../services/recommendation.service");

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

    // Mock inference pipeline until ML endpoint is integrated.
    const inference = mockInference();
    const rawDisease = (inference?.disease || "").toLowerCase();
    const disease = rawDisease.includes("mouth")
      ? "FMD"
      : rawDisease.includes("healthy")
        ? "Healthy"
        : "Other";

    const confidence = Number(inference?.confidence || 0);
    const severity =
      inference?.severity || (disease === "FMD" ? "Moderate" : "Low");

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

    /* 🖼 Save image metadata + summary inference for history */
    const imageRecord = await ImageRecord.create({
      user: req.user.id,
      cow: cow._id,
      imageUrl: `/uploads/${req.file.filename}`,
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

    return res.status(201).json({
      message: "Image uploaded and analyzed successfully",
      cowId: cow._id,
      imageRecordId: imageRecord._id,
      result
    });

  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({
      message: "Failed to process cattle data",
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const records = await ImageRecord.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "imageUrl prediction confidence severity createdAt breed age sex fever temperature"
      );

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