const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockInference = () => ({
  disease: "Foot and Mouth Disease",
  confidence: 0.934,
  severity: "Moderate",
  allProbabilities: { Healthy: 0.066, "Foot and Mouth Disease": 0.934 },
  source: "mock"
});

const getSeverityFromConfidence = (confidence) => {
  if (confidence >= 0.85) return "High";
  if (confidence >= 0.65) return "Moderate";
  return "Low";
};

// ---------------------------------------------------------------------------
// Claude vision validation
// Returns: "YES" | "NO" | "UNCERTAIN"
// UNCERTAIN = blurry/partial image that might be cattle — allowed through
// ---------------------------------------------------------------------------

const validateWithClaude = async (imagePath) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[inference] No ANTHROPIC_API_KEY — skipping validation.");
    return { rejected: false, validation: { source: "claude", decision: "SKIP" } };
  }

  try {
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    const ext = imagePath.split(".").pop().toLowerCase();
    const mediaType = ext === "png" ? "image/png" : "image/jpeg";

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 15,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: imageBase64 }
              },
              {
                type: "text",
                text: `Does this image show a cow or cattle — including full body, close-up of mouth, tongue, hoof, or foot?
Reply with only one word: YES, NO, or UNCERTAIN (if the image is unclear, blurry, or could possibly be cattle).`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        timeout: 10000
      }
    );

    const answer = (response?.data?.content?.[0]?.text || "").trim().toUpperCase();
    const status = response?.data?.stop_reason;

    // Accept YES and UNCERTAIN, reject only explicit NO
    if (answer.startsWith("YES") || answer.startsWith("UNCERTAIN")) {
      return {
        rejected: false,
        validation: { source: "claude", decision: "ACCEPT", answer }
      };
    }

    if (answer.startsWith("NO")) {
      return {
        rejected: true,
        reason: "Image does not appear to be cattle. Please upload a clear image of a cow — full body or a close-up of the mouth/hoof.",
        validation: { source: "claude", decision: "REJECT", answer }
      };
    }

    // Unexpected response format — fail open
    console.warn("[inference] Unexpected Claude answer:", answer, "| stop_reason:", status, "— passing to ML.");
    return { rejected: false, validation: { source: "claude", decision: "SKIP", answer } };

  } catch (err) {
    const status = err?.response?.status;
    const errorType = err?.response?.data?.error?.type || "";

    if (status === 429 || errorType === "rate_limit_error") {
      console.warn("[inference] Claude rate limit hit — passing image to ML model.");
    } else if (status === 529 || errorType === "overloaded_error") {
      console.warn("[inference] Claude API overloaded — passing image to ML model.");
    } else if (err.code === "ECONNABORTED") {
      console.warn("[inference] Claude request timed out — passing image to ML model.");
    } else {
      console.warn("[inference] Claude validation error:", err?.message, "— passing image to ML model.");
    }

    // Always fail-open — never block the user due to Claude being unavailable
    return { rejected: false, validation: { source: "claude", decision: "ERROR", error: err?.message } };
  }
};

// ---------------------------------------------------------------------------
// Main inference entry point
// Claude validation + ML prediction run in parallel
// ---------------------------------------------------------------------------

const inferWithML = async (imagePath) => {
  const mlApiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000/predict";

  const mlForm = new FormData();
  mlForm.append("file", fs.createReadStream(imagePath));

  const [validation, mlResponse] = await Promise.allSettled([
    validateWithClaude(imagePath),
    axios.post(mlApiUrl, mlForm, { headers: mlForm.getHeaders(), timeout: 20000 })
  ]);

  // validateWithClaude never throws (errors are caught inside) — but just in case
  const cowValidation = validation.status === "fulfilled"
    ? validation.value
    : { rejected: false, validation: { source: "claude", decision: "ERROR" } };

  if (cowValidation.rejected) {
    return {
      rejected: true,
      reason: cowValidation.reason,
      validation: cowValidation.validation,
      source: "claude-validation"
    };
  }

  if (mlResponse.status === "fulfilled") {
    const data = mlResponse.value?.data;
    const prediction = data?.prediction || "Other";
    const confidence = Number(data?.confidence || 0);
    return {
      disease: prediction,
      confidence,
      severity: getSeverityFromConfidence(confidence),
      allProbabilities: data?.all_probabilities || {},
      source: "ml",
      validation: cowValidation.validation
    };
  }

  console.error("ML inference failed, using mock fallback:", mlResponse.reason?.message);
  return mockInference();
};

module.exports = { mockInference, inferWithML };
