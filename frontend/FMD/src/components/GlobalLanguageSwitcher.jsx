import LanguageSwitcher from "./LanguageSwitcher";
import { saveLanguagePreference } from "../services/language";

export default function GlobalLanguageSwitcher() {
  const handleLanguageChange = async (lang) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "USER") return;
    try {
      await saveLanguagePreference(lang);
    } catch {
      // Keep UI responsive if preference sync fails.
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]">
      <div className="runtime-language-bar rounded-2xl border border-emerald-100 bg-white/90 p-2 shadow-lg shadow-slate-900/10 ring-1 ring-emerald-50 backdrop-blur-md">
        <LanguageSwitcher compact onChange={handleLanguageChange} />
      </div>
    </div>
  );
}
