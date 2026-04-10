# i18n Extension Guide

## Supported languages
- `en` (English)
- `hi` (Hindi)
- `te` (Telugu)

## Add a new language
1. Create `src/i18n/locales/<code>.json`.
2. Add key-value translations using the same keys as `en.json`.
3. Register the locale in `src/i18n/I18nProvider.jsx`:
   - import JSON
   - add to `DICTIONARIES`
   - add code to `SUPPORTED`
4. Add `<option>` in `src/components/LanguageSwitcher.jsx`.
5. Add backend support:
   - include code in `SUPPORTED_LANGUAGES` in `backend/src/services/language.service.js`
   - optionally update region-to-language mapping in `mapRegionToLanguage()`

## Fallback behavior
- If a key is missing in the current language, the app falls back to English.
- If a language code is unknown, the app defaults to `en`.

