import { api } from "./api";

const SUPPORTED_LANGUAGES = ["en", "hi", "te"];
const STORAGE_PREFIX = "runtime-translations:";
const REQUEST_BATCH_SIZE = 25;

const inMemoryCache = new Map();

function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : "en";
}

function getStorageKey(language) {
  return `${STORAGE_PREFIX}${language}`;
}

function getLanguageCache(language) {
  const safeLanguage = normalizeLanguage(language);

  if (inMemoryCache.has(safeLanguage)) {
    return inMemoryCache.get(safeLanguage);
  }

  let initialCache = {};

  try {
    const raw = localStorage.getItem(getStorageKey(safeLanguage));
    initialCache = raw ? JSON.parse(raw) : {};
  } catch {
    initialCache = {};
  }

  inMemoryCache.set(safeLanguage, initialCache);
  return initialCache;
}

function persistLanguageCache(language) {
  try {
    localStorage.setItem(
      getStorageKey(language),
      JSON.stringify(getLanguageCache(language))
    );
  } catch {
    // Ignore storage failures and keep the in-memory cache.
  }
}

export function getCachedTranslation(language, text) {
  if (!text) return "";
  if (normalizeLanguage(language) === "en") return text;
  return getLanguageCache(language)[text] || "";
}

export async function translateTexts(language, texts) {
  const safeLanguage = normalizeLanguage(language);
  const uniqueTexts = [...new Set((texts || []).map((text) => String(text || "").trim()).filter(Boolean))];

  if (safeLanguage === "en" || uniqueTexts.length === 0) {
    return Object.fromEntries(uniqueTexts.map((text) => [text, text]));
  }

  const cache = getLanguageCache(safeLanguage);
  const missingTexts = uniqueTexts.filter((text) => !cache[text]);

  if (missingTexts.length > 0) {
    for (let i = 0; i < missingTexts.length; i += REQUEST_BATCH_SIZE) {
      const batch = missingTexts.slice(i, i + REQUEST_BATCH_SIZE);
      const response = await api.post("/translation/runtime", {
        language: safeLanguage,
        texts: batch
      });

      Object.assign(cache, response.data?.translations || {});
    }

    persistLanguageCache(safeLanguage);
  }

  return uniqueTexts.reduce((acc, text) => {
    acc[text] = cache[text] || text;
    return acc;
  }, {});
}

export function clearRuntimeTranslationCache(language) {
  const safeLanguage = normalizeLanguage(language);
  inMemoryCache.delete(safeLanguage);
  localStorage.removeItem(getStorageKey(safeLanguage));
}

export { SUPPORTED_LANGUAGES };
