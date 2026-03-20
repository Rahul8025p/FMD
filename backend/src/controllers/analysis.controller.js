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

    // ✅ Prepare image URL (works for local & cloud)
    const imageUrl = req.file.path || `/uploads/${req.file.filename}`;

    /* 🐄 Find or create cow */
    let cow = await Cow.findOne({ rfidTag: rfid });

    if (!cow) {
      cow = await Cow.create({
        rfidTag: rfid,
        owner: req.user?.id, // safer
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

    /* 🖼 Save image metadata */
    const imageRecord = await ImageRecord.create({
      user: req.user?.id,
      cow: cow._id,
      imageUrl,  // ✅ future-proof
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
    });

    return res.status(201).json({
      message: "Image uploaded successfully",
      cowId: cow._id,
      imageRecordId: imageRecord._id,
      imageUrl, // optional but helpful
    });

  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({
      message: "Failed to process cattle data",
    });
  }
};