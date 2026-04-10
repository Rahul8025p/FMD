const User = require("../models/User");
const ImageRecord = require("../models/ImageRecord");

exports.getAdminOverview = async (req, res) => {
  try {
    const [totalUsers, totalCases, fmdCases, healthyCases, recentDetections] =
      await Promise.all([
        User.countDocuments({ role: "USER" }),
        ImageRecord.countDocuments(),
        ImageRecord.countDocuments({ prediction: "FMD" }),
        ImageRecord.countDocuments({ prediction: "Healthy" }),
        ImageRecord.find()
          .sort({ createdAt: -1 })
          .limit(100)
          .populate("user", "name email")
          .select(
            "imageUrl prediction confidence severity fever temperature location rfidTag breed age sex createdAt user"
          )
      ]);

    return res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        totalCases,
        fmdCases,
        healthyCases
      },
      recentDetections
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    return res.status(500).json({
      message: "Failed to fetch admin overview"
    });
  }
};

exports.getCaseHeatmap = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 2000);

    // Bounding box for the Indian mainland/islands
    const indiaBounds = {
      "location.latitude": { $gte: 6, $lte: 38.5 },
      "location.longitude": { $gte: 68, $lte: 97.5 }
    };

    const records = await ImageRecord.find(indiaBounds)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "name email")
      .populate("cow", "rfidTag")
      .select(
        "user cow imageUrl prediction confidence severity fever temperature breed age sex location createdAt rfidTag"
      );

    const cases = records.map((item) => ({
      id: item._id,
      prediction: item.prediction || "N/A",
      confidence: typeof item.confidence === "number" ? item.confidence : null,
      severity: item.severity || "N/A",
      fever: item.fever,
      temperature:
        typeof item.temperature === "number" ? item.temperature : null,
      breed: item.breed || "N/A",
      age: typeof item.age === "number" ? item.age : null,
      sex: item.sex || "N/A",
      imageUrl: item.imageUrl || "",
      location: {
        latitude: item.location?.latitude,
        longitude: item.location?.longitude
      },
      createdAt: item.createdAt,
      report: {
        rfidTag: item.rfidTag || item.cow?.rfidTag || "N/A",
        ownerName: item.user?.name || "Unknown user",
        ownerEmail: item.user?.email || "No email"
      }
    }));

    return res.status(200).json({
      success: true,
      total: cases.length,
      cases
    });
  } catch (err) {
    console.error("Admin case heatmap error:", err);
    return res.status(500).json({
      message: "Failed to fetch case map data"
    });
  }
};
