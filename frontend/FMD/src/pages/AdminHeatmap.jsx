import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../services/api";
import { useI18n } from "../i18n/I18nProvider";
import LanguageSwitcher from "../components/LanguageSwitcher";

const INDIA_CENTER = [22.9734, 78.6569];
const INDIA_BOUNDS = [
  [6, 68],
  [38.5, 97.5]
];

function IconButton({ title, children, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-9 w-9 place-content-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function MapZoomControls() {
  const map = useMap();
  const { onZoomIn, onZoomOut, onExpand } = map.options || {};
  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
      <IconButton
        title="Zoom in"
        onClick={() => {
          onZoomIn?.();
          map.zoomIn();
        }}
      >
        <span className="text-lg leading-none">+</span>
      </IconButton>
      <IconButton
        title="Zoom out"
        onClick={() => {
          onZoomOut?.();
          map.zoomOut();
        }}
      >
        <span className="text-lg leading-none">−</span>
      </IconButton>
      <IconButton title="Expand map" onClick={() => onExpand?.()}>
        <span className="text-base leading-none">⤢</span>
      </IconButton>
    </div>
  );
}

function MapAutoResize({ expanded }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(t);
  }, [expanded, map]);
  return null;
}

function MapExpandOnZoom({ onExpand }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => onExpand?.();
    map.on("zoomstart", handler);
    return () => {
      map.off("zoomstart", handler);
    };
  }, [map, onExpand]);
  return null;
}

function Legend({ title, items }) {
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`h-4 w-4 rounded-sm ${item.swatch}`} />
              <span className="text-xs font-medium text-slate-700">{item.label}</span>
            </div>
            <span className="text-xs text-slate-500">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapPanel({
  title,
  subtitle,
  legendItems,
  cases,
  expanded,
  onSetExpanded,
  updatedAt
}) {
  const [mobileLegendOpen, setMobileLegendOpen] = useState(false);

  return (
    <>
      {expanded ? (
        <button
          type="button"
          onClick={() => onSetExpanded(false)}
          className="fixed inset-0 z-40 bg-slate-900/50"
          aria-label="Close expanded map background"
        />
      ) : null}
      <div
        className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${
          expanded ? "fixed inset-2 z-50 overflow-hidden sm:inset-3" : ""
        }`}
      >
        <div className="border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => onSetExpanded((prev) => !prev)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {expanded ? "Close" : "Expand"}
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-4 p-4 sm:p-6 ${expanded ? "lg:grid-cols-1" : "lg:grid-cols-5"}`}>
          <div className={expanded ? "" : "lg:col-span-3"}>
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-3 py-2">
                <p className="text-xs font-medium text-slate-600">
                  Put your pointer on regions for details
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileLegendOpen((prev) => !prev)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 lg:hidden"
                  >
                    {mobileLegendOpen ? "Hide legend" : "Show legend"}
                  </button>
                  <p className="text-xs text-slate-500">Use + / - to zoom</p>
                </div>
              </div>

              <div className={expanded ? "h-[calc(100vh-165px)] sm:h-[calc(100vh-170px)]" : "h-[340px] sm:h-[460px] lg:h-[500px]"}>
                <MapContainer
                  center={INDIA_CENTER}
                  zoom={5}
                  minZoom={4}
                  maxZoom={9}
                  maxBounds={INDIA_BOUNDS}
                  maxBoundsViscosity={0.8}
                  zoomControl={false}
                  className="h-full w-full"
                  onExpand={() => onSetExpanded(true)}
                  onZoomIn={() => onSetExpanded(true)}
                  onZoomOut={() => onSetExpanded(true)}
                  scrollWheelZoom
                  dragging
                  touchZoom
                  doubleClickZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapZoomControls />
                  <MapAutoResize expanded={expanded} />
                  <MapExpandOnZoom onExpand={() => onSetExpanded(true)} />
                  {cases.map((c) => (
                    <CircleMarker
                      key={`${title}-${c.id}`}
                      center={[c.latitude, c.longitude]}
                      radius={7}
                      eventHandlers={{
                        mouseover: (e) => e.target.openPopup(),
                        mouseout: (e) => e.target.closePopup(),
                        click: (e) => e.target.openPopup()
                      }}
                      pathOptions={{
                        color: c.prediction === "FMD" ? "#dc2626" : "#059669",
                        fillColor: c.prediction === "FMD" ? "#ef4444" : "#10b981",
                        fillOpacity: 0.6,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <p className="font-semibold">{c.ownerName}</p>
                        <p className="text-xs">{c.state}</p>
                        <p className="text-xs">{c.prediction}</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            className="rounded border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700"
                          >
                            Report (mock)
                          </button>
                          <button
                            type="button"
                            className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700"
                          >
                            More info (mock)
                          </button>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>

              {mobileLegendOpen ? (
                <div className="border-t border-slate-200 bg-white p-3 lg:hidden">
                  <Legend title="Color Scale" items={legendItems} />
                </div>
              ) : null}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              <span className="font-medium text-slate-700">
                Updated: {updatedAt || "N/A"}
              </span>
              {" "}• Source: backend `ImageRecord` coordinates
            </p>
          </div>

          {expanded ? null : (
            <div className="hidden lg:col-span-2 lg:block">
              <Legend title="Color Scale" items={legendItems} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminHeatmap() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [error, setError] = useState("");
  const [cases, setCases] = useState([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  const totalFmd = cases.filter((item) => item.prediction === "FMD").length;
  const totalHealthy = cases.filter((item) => item.prediction === "Healthy").length;
  const totalCases = cases.length;
  const legendItems = [
    { label: t("admin.fmdFlagged", "FMD"), swatch: "bg-red-500", count: totalFmd },
    { label: t("admin.healthyCases", "Healthy"), swatch: "bg-emerald-500", count: totalHealthy }
  ];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (mapExpanded) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mapExpanded]);

  useEffect(() => {
    const loadRealCaseData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/admin/case-heatmap?limit=500");
        const incoming = Array.isArray(res.data?.cases) ? res.data.cases : [];

        const normalized = incoming
          .map((item) => {
            const latitude = Number(item?.location?.latitude);
            const longitude = Number(item?.location?.longitude);
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
              return null;
            }

            return {
              id: item.id || item._id,
              latitude,
              longitude,
              prediction: item.prediction || "Other",
              ownerName: item?.report?.ownerName || "Unknown user",
              createdAt: item.createdAt || new Date().toISOString(),
              region: item?.report?.region || "India"
            };
          })
          .filter(Boolean);

        setCases(normalized);
        setLastUpdatedAt(new Date().toLocaleString());
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.clear();
          navigate("/admin/login");
          return;
        }
        setError("Failed to load live case map data. Please restart backend once and try again.");
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealCaseData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-white">
      <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:text-sm"
            >
              Back to Dashboard
            </button>
            <div>
              <p className="text-lg font-semibold text-emerald-800">{t("heatmap.title", "India Case Heatmap")}</p>
              <p className="text-xs text-slate-500">
                Operational geospatial monitoring view (live DB-backed data).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/admin/login");
              }}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              {t("common.logout", "Logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
        <section className="mb-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Monitoring Console
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
            {t("heatmap.heading", "India FMD Case Map")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Hover or tap a case marker to open quick actions. Zoom to expand map into focused mode.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">{t("heatmap.totalPlotted", "Total plotted cases")}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{totalCases}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">{t("heatmap.fmdMarkers", "FMD markers")}</p>
            <p className="mt-2 text-2xl font-semibold text-red-700">{totalFmd}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">{t("heatmap.healthyMarkers", "Healthy markers")}</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{totalHealthy}</p>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6">
          {loading ? (
            <div className="h-[560px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <MapPanel
              title={t("heatmap.panelTitle", "State-wise confirmed FMD cases in India")}
              subtitle={t("heatmap.panelSubtitle", "Put your mouse pointer on states for details")}
              legendItems={legendItems}
              cases={cases}
              expanded={mapExpanded}
              onSetExpanded={setMapExpanded}
              updatedAt={lastUpdatedAt}
            />
          )}
        </section>
      </main>

    </div>
  );
}
