import LanguageSwitcher from "./LanguageSwitcher";

export default function GlobalLanguageSwitcher() {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)]">
      <div className="runtime-language-bar rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
        <LanguageSwitcher compact />
      </div>
    </div>
  );
}
