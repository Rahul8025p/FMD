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

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_HOST}${url}`;
  };

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

            <section className="mt-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-800">Recent detections</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest uploaded and analyzed records from users.
              </p>

              {recentDetections.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">No detections available yet.</p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {recentDetections.map((item) => (
                    <article
                      key={item._id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                    >
                      <div className="h-40 bg-slate-100">
                        {item.imageUrl ? (
                          <img
                            src={getImageUrl(item.imageUrl)}
                            alt="Detection"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-content-center text-xs text-slate-500">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 p-4 text-sm">
                        <p className="font-semibold text-slate-800">
                          {item.user?.name || "Unknown user"}
                        </p>
                        <p className="text-slate-600">{item.user?.email || "No email"}</p>
                        <p className="text-slate-700">
                          Prediction: <span className="font-medium">{item.prediction || "N/A"}</span>
                        </p>
                        <p className="text-slate-600">
                          Confidence:{" "}
                          {typeof item.confidence === "number"
                            ? `${(item.confidence * 100).toFixed(2)}%`
                            : "N/A"}
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
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
