import { api } from "./api";

export async function saveLanguagePreference(language) {
  const res = await api.patch("/user/language", { language });
  return res.data;
}

export async function autoDetectLanguageFromCoordinates(latitude, longitude) {
  const res = await api.post("/user/language/auto-detect", {
    latitude,
    longitude
  });
  return res.data;
}

export function runSilentGeoLanguageDetection(onLanguageDetected) {
  if (localStorage.getItem("langManualOverride") === "1") return;
  if (!("geolocation" in navigator)) return;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const detected = await autoDetectLanguageFromCoordinates(
          pos.coords.latitude,
          pos.coords.longitude
        );
        if (detected?.language) {
          localStorage.setItem("language", detected.language);
          onLanguageDetected?.(detected.language);
        }
      } catch {
        // Silent by design: do not block or show noisy errors.
      }
    },
    () => {
      // Permission denied or unavailable -> keep current/default language.
    },
    { timeout: 5000, maximumAge: 600000, enableHighAccuracy: false }
  );
}

