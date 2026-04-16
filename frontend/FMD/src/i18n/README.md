# Runtime i18n Guide

## Supported languages
- `en` (English)
- `hi` (Hindi)
- `te` (Telugu)

## How it works
- The frontend translates visible DOM text, placeholders, titles, and `aria-label`s at runtime.
- The backend exposes `/api/translation/runtime` for batch translation requests.
- Client and server both cache translations to reduce repeated calls and make switching faster.

## Add a new language
1. Add the code to `SUPPORTED_LANGUAGES` in:
   - `frontend/FMD/src/services/runtimeTranslation.js`
   - `backend/src/services/runtimeTranslation.service.js`
2. Add the language option in `frontend/FMD/src/components/LanguageSwitcher.jsx`.
3. If auto-detection should choose that language, update the mapping in `backend/src/services/language.service.js`.

## Notes
- No static locale JSON files are used by the runtime translation pipeline.
- English remains the source/fallback language if translation is unavailable.

