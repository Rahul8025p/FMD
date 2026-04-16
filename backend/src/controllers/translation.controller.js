const {
  MAX_BATCH_SIZE,
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  translateTexts
} = require("../services/runtimeTranslation.service");

exports.translateRuntimeContent = async (req, res) => {
  try {
    const language = normalizeLanguage(req.body?.language);
    const texts = Array.isArray(req.body?.texts) ? req.body.texts : [];

    if (texts.length > MAX_BATCH_SIZE) {
      return res.status(400).json({
        message: `A maximum of ${MAX_BATCH_SIZE} texts can be translated per request.`
      });
    }

    const translations = await translateTexts(texts, language);

    return res.status(200).json({
      success: true,
      language,
      supportedLanguages: SUPPORTED_LANGUAGES,
      translations
    });
  } catch (error) {
    console.error("Runtime translation error:", error);
    return res.status(502).json({
      message: "Failed to translate content at runtime."
    });
  }
};
