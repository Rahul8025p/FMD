import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../services/api";

const API_HOST = "http://localhost:5000";
const INDIA_CENTER = [22.9734, 78.6569];
const INDIA_BOUNDS = [
  [6, 68],
  [38.5, 97.5]
];

const markerStyleByPrediction = {
  FMD: { color: "#dc2626", fillColor: "#ef4444" },
  Healthy: { color: "#059669", fillColor: "#10b981" },
  Other: { color: "#d97706", fillColor: "#f59e0b" }
};

function getMarkerStyle(prediction) {
  return markerStyleByPrediction[prediction] || {
    color: "#475569",
    fillColor: "#64748b"
  };
}

export default function AdminHeatmap() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");

  useEffect(() => {
    const loadMapCases = async () => {
      try {
        const res = await api.get("/admin/case-heatmap");
        const items = res.data?.cases || [];
        setCases(items);
        setSelectedCaseId(items[0]?.id || "");
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.clear();
          navigate("/admin/login");
          return;
        }
        setError("Unable to load case heatmap.");
      } finally {
        setLoading(false);
      }
    };

    loadMapCases();
  }, [navigate]);

  const selectedCase = useMemo(
    () => cases.find((item) => item.id === selectedCaseId) || null,
    [cases, selectedCaseId]
  );

  const totalFmd = cases.filter((item) => item.prediction === "FMD").length;
  const totalHealthy = cases.filter((item) => item.prediction === "Healthy").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-white">
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:text-sm"
            >
              Back to Dashboard
            </button>
            <div>
              <p className="text-lg font-semibold text-emerald-800">India Case Heatmap</p>
              <p className="text-xs text-slate-500">Geo-distribution of FMD and healthy reports</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/admin/login");
            }}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">Total plotted cases</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{cases.length}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">FMD markers</p>
            <p className="mt-2 text-2xl font-semibold text-red-700">{totalFmd}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">Healthy markers</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{totalHealthy}</p>
          </div>
        </section>

        {loading && (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Loading map data...</p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
            <article className="xl:col-span-3 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm sm:p-4">
              <div className="h-[420px] w-full overflow-hidden rounded-xl border border-slate-200 sm:h-[500px]">
                <MapContainer
                  center={INDIA_CENTER}
                  zoom={5}
                  minZoom={4}
                  scrollWheelZoom
                  maxBounds={INDIA_BOUNDS}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {cases.map((item) => {
                    const markerStyle = getMarkerStyle(item.prediction);
                    return (
                      <CircleMarker
                        key={item.id}
                        center={[item.location.latitude, item.location.longitude]}
                        radius={selectedCaseId === item.id ? 10 : 7}
                        pathOptions={{
                          color: markerStyle.color,
                          fillColor: markerStyle.fillColor,
                          fillOpacity: 0.55,
                          weight: 2
                        }}
                        eventHandlers={{
                          click: () => setSelectedCaseId(item.id)
                        }}
                      >
                        <Popup>
                          <p className="font-semibold text-slate-800">{item.report.ownerName}</p>
                          <p className="text-xs text-slate-600">{item.prediction}</p>
                          <p className="text-xs text-slate-600">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            </article>

            <article className="xl:col-span-2 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-800">Case report details</h2>
              <p className="mt-1 text-sm text-slate-600">
                Select a marker on the map or choose a case below.
              </p>

              {selectedCase ? (
                <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-800">{selectedCase.report.ownerName}</p>
                  <p className="text-slate-600">{selectedCase.report.ownerEmail}</p>
                  <p className="text-slate-700">
                    Prediction: <span className="font-medium">{selectedCase.prediction}</span>
                  </p>
                  <p className="text-slate-700">
                    Confidence:{" "}
                    {typeof selectedCase.confidence === "number"
                      ? `${(selectedCase.confidence * 100).toFixed(2)}%`
                      : "N/A"}
                  </p>
                  <p className="text-slate-700">
                    Severity: <span className="font-medium">{selectedCase.severity}</span>
                  </p>
                  <p className="text-slate-700">
                    RFID: <span className="font-medium">{selectedCase.report.rfidTag}</span>
                  </p>
                  <p className="text-slate-700">
                    Temp/Fever:{" "}
                    <span className="font-medium">
                      {selectedCase.fever ? "Fever" : "No fever"}
                      {typeof selectedCase.temperature === "number"
                        ? ` (${selectedCase.temperature}°F)`
                        : ""}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedCase.createdAt).toLocaleString()}
                  </p>
                  {selectedCase.imageUrl ? (
                    <a
                      href={`${API_HOST}${selectedCase.imageUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Open uploaded image
                    </a>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">No case selected.</p>
              )}

              <div className="mt-5 max-h-56 space-y-2 overflow-auto pr-1">
                {cases.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedCaseId(item.id)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                      selectedCaseId === item.id
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-medium text-slate-800">{item.report.ownerName}</p>
                    <p className="text-xs text-slate-500">
                      {item.prediction} • {item.location.latitude.toFixed(3)},
                      {" "}
                      {item.location.longitude.toFixed(3)}
                    </p>
                  </button>
                ))}
              </div>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}
