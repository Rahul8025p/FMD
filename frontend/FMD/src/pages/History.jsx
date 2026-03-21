import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const API_HOST = "http://localhost:5000";

export default function History() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get("/user/history");
        setItems(res.data?.history || []);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        setError("Unable to load detection history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [navigate]);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_HOST}${url}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-emerald-50 to-white px-4 py-6 sm:px-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Detection Records
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-800 sm:text-3xl">
                History
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Previous uploaded cases with prediction and date/time.
              </p>
            </div>
            <button
              onClick={() => navigate("/user")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to dashboard
            </button>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-52 animate-pulse rounded-2xl bg-white shadow-sm" />
            <div className="h-52 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">No previous detections found.</p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Analyze first case
            </button>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm"
              >
                <div className="h-44 bg-slate-100">
                  {item.imageUrl ? (
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt="Uploaded cattle"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-content-center text-xs text-slate-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Prediction: {item.prediction || "N/A"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Confidence:{" "}
                    {typeof item.confidence === "number"
                      ? `${(item.confidence * 100).toFixed(2)}%`
                      : "N/A"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Date/Time:{" "}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

