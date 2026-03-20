const User = require("../models/User");
const Cow = require("../models/cow");
const ImageRecord = require("../models/ImageRecord");

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

    /* 🖼 Save image metadata */
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
    });

    return res.status(201).json({
      message: "Image uploaded successfully",
      cowId: cow._id,
      imageRecordId: imageRecord._id,
    });

  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({
      message: "Failed to process cattle data",
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