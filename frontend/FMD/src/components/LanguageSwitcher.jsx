import { useI18n } from "../i18n/I18nProvider";

export default function LanguageSwitcher({ compact = false, onChange }) {
  const { language, setLanguage, t } = useI18n();
  const LANG_LABELS = {
    en: "English",
    hi: "हिंदी",
    te: "తెలుగు"
  };

  return (
    <label
      className={`language-switcher inline-flex flex-nowrap items-center gap-2 rounded-full border border-emerald-100 bg-white/95 px-2 py-1 shadow-sm backdrop-blur ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <span className="grid h-7 w-7 place-content-center rounded-full bg-emerald-50 text-emerald-700" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none">
          <path d="M4 12h16M12 4a15 15 0 0 1 0 16M12 4a15 15 0 0 0 0 16M6 7h12M6 17h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className="whitespace-nowrap pr-0.5 font-medium text-slate-600">{t("lang.label", "Language")}</span>
      <select
        value={language}
        onChange={(e) => {
          localStorage.setItem("langManualOverride", "1");
          setLanguage(e.target.value);
          onChange?.(e.target.value);
        }}
        aria-label={t("lang.label", "Language")}
        className={`min-h-9 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 outline-none transition hover:border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${
          compact ? "w-28 text-xs" : "w-32 text-sm"
        }`}
      >
        <option value="en">{LANG_LABELS.en}</option>
        <option value="hi">{LANG_LABELS.hi}</option>
        <option value="te">{LANG_LABELS.te}</option>
      </select>
    </label>
  );
}

