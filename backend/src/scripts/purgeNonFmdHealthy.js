const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const connectDB = require("../config/db");
const ImageRecord = require("../models/ImageRecord");

const ALLOWED = ["FMD", "Healthy"];

async function run() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run") || args.includes("--dryrun");

  await connectDB();

  const filter = {
    $or: [
      { prediction: { $exists: false } },
      { prediction: { $eq: null } },
      { prediction: { $nin: ALLOWED } }
    ]
  };

  const toDelete = await ImageRecord.countDocuments(filter);
  console.log(
    JSON.stringify(
      {
        dryRun: isDryRun,
        allowedPredictions: ALLOWED,
        matchingRecords: toDelete
      },
      null,
      2
    )
  );

  if (isDryRun) {
    process.exit(0);
  }

  const res = await ImageRecord.deleteMany(filter);
  console.log(
    JSON.stringify(
      {
        deletedCount: res?.deletedCount ?? 0
      },
      null,
      2
    )
  );

  process.exit(0);
}

run().catch((err) => {
  console.error("Purge script failed:", err);
  process.exit(1);
});

