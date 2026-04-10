import { useI18n } from "../i18n/I18nProvider";

export default function LanguageSwitcher({ compact = false, onChange }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <label className={`inline-flex items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      <span className="text-slate-600">{t("lang.label", "Language")}</span>
      <select
        value={language}
        onChange={(e) => {
          localStorage.setItem("langManualOverride", "1");
          setLanguage(e.target.value);
          onChange?.(e.target.value);
        }}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700"
      >
        <option value="en">{t("lang.english", "English")}</option>
        <option value="hi">{t("lang.hindi", "Hindi")}</option>
        <option value="te">{t("lang.telugu", "Telugu")}</option>
      </select>
    </label>
  );
}

