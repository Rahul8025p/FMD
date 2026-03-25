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
            "imageUrl prediction confidence severity fever location.latitude location.longitude createdAt user"
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
