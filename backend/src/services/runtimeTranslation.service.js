const SUPPORTED_LANGUAGES = ["en", "hi", "te"];
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const MAX_BATCH_SIZE = 50;
const MAX_TEXT_LENGTH = 2000;

const translationCache = new Map();

function normalizeLanguage(language) {
  const normalized = String(language || "en").trim().toLowerCase();
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : "en";
}

function normalizeSourceText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function getCacheKey(language, text) {
  return `${language}::${text}`;
}

function getCachedTranslation(language, text) {
  const key = getCacheKey(language, text);
  const cached = translationCache.get(key);

  if (!cached) return null;
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    translationCache.delete(key);
    return null;
  }

  return cached.value;
}

function setCachedTranslation(language, text, value) {
  const key = getCacheKey(language, text);
  translationCache.set(key, {
    value,
    createdAt: Date.now()
  });
}

async function translateWithGoogleRuntime(text, targetLanguage) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", targetLanguage);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "FMD-RuntimeTranslation/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Translation request failed with ${response.status}`);
  }

  const payload = await response.json();
  const translated = Array.isArray(payload?.[0])
    ? payload[0]
        .map((part) => (Array.isArray(part) ? part[0] : ""))
        .join("")
        .trim()
    : "";

  return translated || text;
}

async function translateTexts(texts, language) {
  const targetLanguage = normalizeLanguage(language);
  const uniqueTexts = [...new Set((texts || []).map(normalizeSourceText).filter(Boolean))];

  if (targetLanguage === "en" || uniqueTexts.length === 0) {
    return uniqueTexts.reduce((acc, text) => {
      acc[text] = text;
      return acc;
    }, {});
  }

  const limitedTexts = uniqueTexts.slice(0, MAX_BATCH_SIZE).map((text) =>
    text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text
  );

  const translatedEntries = await Promise.all(
    limitedTexts.map(async (text) => {
      const cached = getCachedTranslation(targetLanguage, text);
      if (cached) {
        return [text, cached];
      }

      const translated = await translateWithGoogleRuntime(text, targetLanguage);
      setCachedTranslation(targetLanguage, text, translated);
      return [text, translated];
    })
  );

  return Object.fromEntries(translatedEntries);
}

module.exports = {
  MAX_BATCH_SIZE,
  MAX_TEXT_LENGTH,
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  normalizeSourceText,
  translateTexts
};
