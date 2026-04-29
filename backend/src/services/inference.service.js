const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const mockInference = () => ({
  disease: "Foot and Mouth Disease",
  confidence: 0.934,
  severity: "Moderate",
  allProbabilities: {
    Healthy: 0.066,
    "Foot and Mouth Disease": 0.934
  },
  source: "mock"
});

const getSeverityFromConfidence = (confidence) => {
  if (confidence >= 0.85) return "High";
  if (confidence >= 0.65) return "Moderate";
  return "Low";
};

const inferWithML = async (imagePath) => {
  const mlApiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000/predict";

  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));

    const response = await axios.post(mlApiUrl, form, {
      headers: form.getHeaders(),
      timeout: 20000
    });

    const prediction = response?.data?.prediction || "Other";
    const confidence = Number(response?.data?.confidence || 0);
    const allProbabilities = response?.data?.all_probabilities || {};

    return {
      disease: prediction,
      confidence,
      severity: getSeverityFromConfidence(confidence),
      allProbabilities,
      source: "ml"
    };
  } catch (err) {
    console.error("ML inference failed, using mock fallback:", err.message);
    return mockInference();
  }
};

module.exports = { mockInference, inferWithML };
