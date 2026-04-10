import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../services/api";
import { useI18n } from "../i18n/I18nProvider";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { saveLanguagePreference } from "../services/language";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { t, setLanguage } = useI18n();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [_sessionError, setSessionError] = useState("");
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/user/home", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(res.data.user);

        localStorage.setItem("name", res.data.user.name);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("language", res.data.user.languagePreference || "en");
        setLanguage(res.data.user.languagePreference || "en");
        // Load history for graphs (best-effort; dashboard stays usable if it fails)
        try {
          setHistoryLoading(true);
          const historyRes = await api.get("/user/history");
          setHistoryItems(historyRes.data?.history || []);
        } catch {
          setHistoryError("Unable to load dashboard charts.");
        } finally {
          setHistoryLoading(false);
        }
      } catch {
        setSessionError("Your session has expired. Please sign in again.");
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, setLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-8 w-36 animate-pulse rounded-md bg-slate-200" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
          </div>
          <div className="mt-6 h-40 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const now = new Date();
  const start7 = new Date(now);
  start7.setDate(now.getDate() - 6);

  const last7Items = historyItems.filter((x) => {
    const t = x?.createdAt ? new Date(x.createdAt).getTime() : 0;
    return t >= start7.getTime();
  });

  const last7Total = last7Items.length;
  const last7Fmd = last7Items.filter((x) => x?.prediction === "FMD").length;
  const last7Healthy = last7Items.filter((x) => x?.prediction === "Healthy").length;
  const last7Flagged = Math.max(0, last7Total - last7Healthy);

  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - idx));
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    return { key, label, fmd: 0, healthy: 0, total: 0 };
  });

  for (const item of historyItems) {
    if (!item?.createdAt) continue;
    const d = new Date(item.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const bucket = last7Days.find((x) => x.key === key);
    if (!bucket) continue;

    bucket.total += 1;
    if (item.prediction === "FMD") bucket.fmd += 1;
    else if (item.prediction === "Healthy") bucket.healthy += 1;
  }

  const maxDayTotal = Math.max(
    ...last7Days.map((x) => x.total),
    1
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-emerald-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:text-sm"
            >
              {t("common.back", "Back")}
            </button>
            <div className="h-9 w-9 rounded-md bg-emerald-600 text-white grid place-content-center font-bold">
              CC
            </div>
            <span className="text-lg font-semibold text-emerald-800">
              CattleCare AI
            </span>
          </div>
          <div className="relative">
            <div className="mb-2 text-right">
              <LanguageSwitcher
                compact
                onChange={async (lang) => {
                  try {
                    await saveLanguagePreference(lang);
                  } catch {
                    // Keep UI responsive even if preference sync fails.
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
              >
                <div className="px-4 py-3 text-sm text-slate-700">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {t("profile.title", "Profile")}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  {t("common.logout", "Logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800">
            {t("user.welcome", "Welcome")}, {user?.name} 🌾
          </h2>
          <p className="mt-1 text-slate-600">
            Monitor cattle health and detect diseases early using AI-powered image
            analysis.
          </p>
        </div>

        {/* Stats / Highlights */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Scans (7 days)</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {historyLoading ? "…" : last7Total}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Healthy scans</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {historyLoading ? "…" : last7Healthy}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Cases flagged</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {historyLoading ? "…" : last7Flagged}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">FMD cases</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {historyLoading ? "…" : last7Fmd}
            </p>
          </div>
        </section>

        {/* Graphs */}
        <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">
              FMD vs Healthy (7 days)
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Auto from your detection history.
            </p>
            <div className="mt-4 flex items-end gap-4">
              {(() => {
                const max = Math.max(last7Fmd, last7Healthy, 1);
                const bars = [
                  { label: "FMD", value: last7Fmd, bg: "bg-red-600" },
                  { label: "Healthy", value: last7Healthy, bg: "bg-emerald-600" }
                ];

                return bars.map((b) => {
                  const heightPct = (b.value / max) * 100;
                  return (
                    <div key={b.label} className="w-24 text-center">
                      <div className="mx-auto h-32 flex items-end justify-center bg-slate-50 rounded-lg border border-slate-200 p-2">
                        <div
                          className={`w-full rounded-lg ${b.bg}`}
                          style={{ height: `${Math.max(8, heightPct)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-slate-700">
                        {b.label}
                      </p>
                      <p className="text-xs text-slate-500">{b.value}</p>
                    </div>
                  );
                });
              })()}
            </div>
            {historyError ? (
              <p className="mt-3 text-xs text-red-600">{historyError}</p>
            ) : null}
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">
              Trend (last 7 days)
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Each bar shows total uploads; segments show prediction type.
            </p>
            <div className="mt-5 h-36 flex items-end gap-2 overflow-x-auto pb-1">
              {last7Days.map((d) => {
                const total = d.total;
                const h = (total / maxDayTotal) * 120;
                const heightPx = Math.max(12, h);
                return (
                  <div key={d.key} className="w-10 flex flex-col items-center">
                    <div
                      className="w-9 rounded-lg border border-slate-200 bg-white overflow-hidden flex flex-col-reverse"
                      style={{ height: `${heightPx}px` }}
                      aria-label={`Total: ${total}`}
                    >
                      <div style={{ flex: d.healthy || 0 }} className="bg-emerald-600/80" />
                      <div style={{ flex: d.fmd || 0 }} className="bg-red-600/90" />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-slate-600">
                      {d.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-red-600/90" />
                FMD
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-emerald-600/80" />
                Healthy
              </div>
            </div>
          </div>
        </section>

        {/* Quick actions + Learn */}
        <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-700 to-lime-700 p-7 text-white lg:col-span-2">
            <h3 className="text-xl font-semibold">{t("analyze.title", "Analyze Cattle Health")}</h3>
            <p className="mt-1 text-emerald-100">
              Upload images and let AI assist you in disease detection.
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-5 rounded-lg bg-white px-6 py-3 font-medium text-emerald-700 transition hover:bg-slate-100"
            >
              Start Analysis →
            </button>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h4 className="font-semibold text-slate-800">Quick actions</h4>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <button
                onClick={() => navigate("/analyze")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                New scan
              </button>
              <button
                onClick={() => navigate("/result")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                View results
              </button>
              <button
                onClick={() => navigate("/user")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                My herd
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Profile
              </button>
              <button
                onClick={() => navigate("/history")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                History
              </button>
              <button
                onClick={() => navigate("/disease-info")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Help
              </button>
            </div>
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold text-slate-800">Recent detections</h3>
          <p className="mt-1 text-sm text-slate-500">
            Latest analyzed records with geo-coordinates and case details.
          </p>
          {historyLoading ? (
            <div className="mt-4 h-28 animate-pulse rounded-xl bg-slate-100" />
          ) : historyItems.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No detections available yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {historyItems.slice(0, 9).map((item) => (
                <article
                  key={item._id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.rfidTag || "No RFID"}
                    </p>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                      {item.prediction || "N/A"}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p>
                      Confidence:{" "}
                      {typeof item.confidence === "number"
                        ? `${(item.confidence * 100).toFixed(2)}%`
                        : "N/A"}
                    </p>
                    <p>
                      Severity: <span className="font-medium">{item.severity || "N/A"}</span>
                    </p>
                    <p>
                      Fever:{" "}
                      {item.fever === true ? "Yes" : item.fever === false ? "No" : "N/A"}
                    </p>
                    <p>
                      Temp:{" "}
                      {typeof item.temperature === "number"
                        ? `${item.temperature}\u00b0F`
                        : "N/A"}
                    </p>
                    <p>
                      Cattle:{" "}
                      <span className="font-medium">
                        {[item.breed, item.sex, item.age]
                          .filter((x) => x !== undefined && x !== null && x !== "")
                          .join(" / ") || "N/A"}
                      </span>
                    </p>
                    <p>
                      Geo:{" "}
                      {typeof item.location?.latitude === "number" &&
                      typeof item.location?.longitude === "number"
                        ? `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`
                        : "N/A"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Info cards */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold">📷 Image-Based Diagnosis</h3>
            <p className="text-sm text-slate-600">
              Upload or capture cattle images to detect diseases using deep learning.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold">🧠 AI-Powered Insights</h3>
            <p className="text-sm text-slate-600">
              MobileNet Model analysis of hooves and mouth lesions for early detection.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold">🛡️ Preventive Guidance</h3>
            <p className="text-sm text-slate-600">
              Treatment and vaccination recommendations after diagnosis.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
