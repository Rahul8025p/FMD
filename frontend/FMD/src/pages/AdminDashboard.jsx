import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const API_HOST = "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalCases: 0,
    fmdCases: 0,
    healthyCases: 0
  });
  const [recentDetections, setRecentDetections] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const totalRecent = recentDetections.length;
  const fmdRecent = recentDetections.filter((x) => x?.prediction === "FMD").length;
  const healthyRecent = recentDetections.filter((x) => x?.prediction === "Healthy").length;
  const otherRecent = Math.max(0, totalRecent - fmdRecent - healthyRecent);

  const now = new Date();
  const start7 = new Date(now);
  start7.setDate(now.getDate() - 6);
  const trendItems = recentDetections.filter((x) => {
    const t = x?.createdAt ? new Date(x.createdAt).getTime() : 0;
    return t >= start7.getTime();
  });

  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - idx));
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    return { key, label, fmd: 0, healthy: 0, other: 0, total: 0 };
  });

  for (const item of trendItems) {
    if (!item?.createdAt) continue;
    const d = new Date(item.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const bucket = days.find((x) => x.key === key);
    if (!bucket) continue;
    bucket.total += 1;
    if (item.prediction === "FMD") bucket.fmd += 1;
    else if (item.prediction === "Healthy") bucket.healthy += 1;
    else bucket.other += 1;
  }

  const maxDayTotal = Math.max(...days.map((x) => x.total), 1);

  const totalPages = Math.max(1, Math.ceil(recentDetections.length / pageSize));
  const paginatedDetections = recentDetections.slice(
    (page - 1) * pageSize,
    (page - 1) * pageSize + pageSize
  );

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const res = await api.get("/admin/overview");
        setOverview(res.data?.overview || {});
        setRecentDetections(res.data?.recentDetections || []);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.clear();
          navigate("/admin/login");
          return;
        }
        setError("Unable to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [navigate]);

  useEffect(() => {
    setPage(1);
  }, [recentDetections.length]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-white">
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/login")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:text-sm"
            >
              Back
            </button>
            <div className="grid h-9 w-9 place-content-center rounded-md bg-emerald-700 font-bold text-white">
              CC
            </div>
            <div>
              <p className="text-lg font-semibold text-emerald-800">CattleCare AI</p>
              <p className="text-xs text-slate-500">Admin Monitoring Panel</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-10">
        <section className="mb-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Admin Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-800 sm:text-3xl">
            Disease Monitoring & Operations
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Track detection trends, review recent uploads, and monitor herd-health signals.
          </p>
        </section>

        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="h-28 animate-pulse rounded-xl bg-white shadow-sm" />
            <div className="h-28 animate-pulse rounded-xl bg-white shadow-sm" />
            <div className="h-28 animate-pulse rounded-xl bg-white shadow-sm" />
            <div className="h-28 animate-pulse rounded-xl bg-white shadow-sm" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total users</p>
                <p className="mt-2 text-2xl font-semibold text-slate-800">{overview.totalUsers || 0}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total detections</p>
                <p className="mt-2 text-2xl font-semibold text-slate-800">{overview.totalCases || 0}</p>
              </div>
              <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">FMD flagged</p>
                <p className="mt-2 text-2xl font-semibold text-red-700">{overview.fmdCases || 0}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Healthy cases</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-700">{overview.healthyCases || 0}</p>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">
                  Recent FMD vs Healthy
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  From your latest user uploads.
                </p>

                <div className="mt-4 flex items-end gap-4">
                  {(() => {
                    const max = Math.max(fmdRecent, healthyRecent, 1);
                    const bars = [
                      { label: "FMD", value: fmdRecent, bg: "bg-red-600" },
                      { label: "Healthy", value: healthyRecent, bg: "bg-emerald-600" }
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
                <p className="mt-3 text-xs text-slate-600">
                  Other: <span className="font-semibold">{otherRecent}</span>
                </p>
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">
                  Trend (last 7 days)
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Segments show prediction types within recent records.
                </p>

                <div className="mt-5 h-36 flex items-end gap-2 overflow-x-auto pb-1">
                  {days.map((d) => {
                    const h = (d.total / maxDayTotal) * 120;
                    const heightPx = Math.max(12, h);
                    return (
                      <div key={d.key} className="w-10 flex flex-col items-center">
                        <div
                          className="w-9 rounded-lg border border-slate-200 bg-white overflow-hidden flex flex-col-reverse"
                          style={{ height: `${heightPx}px` }}
                        >
                          <div style={{ flex: d.other || 0 }} className="bg-amber-500/20" />
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
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-800">Recent detections</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest uploaded and analyzed records from users.
              </p>

              {recentDetections.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">No detections available yet.</p>
              ) : (
                <>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {paginatedDetections.map((item) => (
                      <article
                        key={item._id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {item.user?.name || "Unknown user"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.user?.email || "No email"}
                            </p>
                          </div>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                            {item.prediction || "N/A"}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1 text-sm">
                          <p className="text-slate-600">
                            Confidence:{" "}
                            {typeof item.confidence === "number"
                              ? `${(item.confidence * 100).toFixed(2)}%`
                              : "N/A"}
                          </p>
                          <p className="text-slate-600">
                            Severity: <span className="font-medium">{item.severity || "N/A"}</span>
                          </p>
                        <p className="text-slate-600">
                          Fever:{" "}
                          {item.fever === true ? "Yes" : item.fever === false ? "No" : "N/A"}
                        </p>
                          <p className="text-xs text-slate-500">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">
                      Page{" "}
                      <span className="font-semibold">
                        {page}/{totalPages}
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
