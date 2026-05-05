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

const ROBOFLOW_ENDPOINT = process.env.ROBOFLOW_ENDPOINT || "https://serverless.roboflow.com/cow-detection-owqvd/1";
const ROBOFLOW_COW_CONFIDENCE_THRESHOLD = Number(process.env.ROBOFLOW_COW_CONFIDENCE_THRESHOLD || 0.81);

const validateCowWithRoboflow = async (imagePath) => {
  const apiKey = process.env.ROBOFLOW_API_KEY;
  if (!apiKey) {
    return {
      rejected: true,
      reason: "Cow validation is not configured. Missing ROBOFLOW_API_KEY.",
      validation: { source: "roboflow", decision: "REJECT", confidence: 0 }
    };
  }

  try {
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    const response = await axios({
      method: "POST",
      url: ROBOFLOW_ENDPOINT,
      params: { api_key: apiKey },
      data: imageBase64,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 20000
    });

    const predictions = Array.isArray(response?.data?.predictions) ? response.data.predictions : [];
    const cowPredictions = predictions.filter((p) =>
      String(p?.class || "").toLowerCase().includes("cow")
    );
    const topCow = cowPredictions.sort((a, b) => Number(b?.confidence || 0) - Number(a?.confidence || 0))[0];
    const topConfidence = Number(topCow?.confidence || 0);

    if (topConfidence >= ROBOFLOW_COW_CONFIDENCE_THRESHOLD) {
      return {
        rejected: false,
        validation: {
          source: "roboflow",
          decision: "ACCEPT",
          confidence: topConfidence,
          threshold: ROBOFLOW_COW_CONFIDENCE_THRESHOLD,
          class: topCow?.class || "cow"
        }
      };
    }

    return {
      rejected: true,
      reason:
        `Cow not confidently detected (confidence ${(topConfidence * 100).toFixed(1)}%, ` +
        `required ${(ROBOFLOW_COW_CONFIDENCE_THRESHOLD * 100).toFixed(0)}%).`,
      validation: {
        source: "roboflow",
        decision: "REJECT",
        confidence: topConfidence,
        threshold: ROBOFLOW_COW_CONFIDENCE_THRESHOLD,
        class: topCow?.class || null
      }
    };
  } catch (err) {
    return {
      rejected: true,
      reason: "Cow validation failed. Please try again.",
      validation: {
        source: "roboflow",
        decision: "REJECT",
        confidence: 0,
        error: err?.message || "Unknown Roboflow error"
      }
    };
  }
};

const inferWithML = async (imagePath) => {
  const mlApiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000/predict";
  const cowValidation = await validateCowWithRoboflow(imagePath);
  if (cowValidation.rejected) {
    return {
      rejected: true,
      reason: cowValidation.reason || "Only cattle images are allowed.",
      validation: cowValidation.validation,
      source: "roboflow-validation"
    };
  }

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
      source: "ml",
      validation: cowValidation.validation
    };
  } catch (err) {
    console.error("ML inference failed, using mock fallback:", err.message);
    return mockInference();
  }
};

module.exports = { mockInference, inferWithML };
