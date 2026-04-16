import { useI18n } from "../i18n/I18nProvider";

export default function LanguageSwitcher({ compact = false, onChange }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <label
      className={`language-switcher inline-flex items-center gap-2 rounded-xl bg-transparent ${compact ? "text-xs" : "text-sm"}`}
    >
      <span className="text-slate-600">{t("lang.label", "Language")}</span>
      <select
        value={language}
        onChange={(e) => {
          localStorage.setItem("langManualOverride", "1");
          setLanguage(e.target.value);
          onChange?.(e.target.value);
        }}
        aria-label={t("lang.label", "Language")}
        className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
      >
        <option value="en">{t("lang.english", "English")}</option>
        <option value="hi">{t("lang.hindi", "Hindi")}</option>
        <option value="te">{t("lang.telugu", "Telugu")}</option>
      </select>
    </label>
  );
}

