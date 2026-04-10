const SUPPORTED_LANGUAGES = ["en", "hi", "te"];

function normalizeLanguage(lang) {
  if (!lang) return "en";
  const trimmed = String(lang).toLowerCase().trim();
  return SUPPORTED_LANGUAGES.includes(trimmed) ? trimmed : "en";
}

function mapRegionToLanguage(countryCode, state = "") {
  const cc = String(countryCode || "").toUpperCase();
  const normalizedState = String(state || "").toLowerCase();

  if (cc === "IN") {
    if (
      normalizedState.includes("telangana") ||
      normalizedState.includes("andhra")
    ) {
      return "te";
    }
    return "hi";
  }

  // Keep unsupported locales on English fallback.
  return "en";
}

async function detectLanguageFromCoordinates(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return {
      language: "en",
      countryCode: null,
      region: null
    };
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lon.toString());
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "FMD-GeoLanguage/1.0 (contact: support@example.com)"
      }
    });

    if (!response.ok) {
      return {
        language: "en",
        countryCode: null,
        region: null
      };
    }

    const data = await response.json();
    const address = data?.address || {};
    const countryCode = address?.country_code
      ? String(address.country_code).toUpperCase()
      : null;
    const region =
      address?.state || address?.region || address?.county || address?.city;

    return {
      language: mapRegionToLanguage(countryCode, region),
      countryCode,
      region: region || null
    };
  } catch (_) {
    return {
      language: "en",
      countryCode: null,
      region: null
    };
  }
}

module.exports = {
  SUPPORTED_LANGUAGES,
  normalizeLanguage,
  detectLanguageFromCoordinates
};

