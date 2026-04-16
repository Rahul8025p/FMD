import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";
import { api } from "../services/api";
import { useI18n } from "../i18n/I18nProvider";
import LanguageSwitcher from "../components/LanguageSwitcher";

const INDIA_CENTER = [22.9734, 78.6569];
const INDIA_BOUNDS = [
  [6, 68],
  [38.5, 97.5]
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
  const { t } = useI18n();
  const { onZoomIn, onZoomOut, onExpand } = map.options || {};
  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
      <IconButton
        title={t("heatmap.zoomIn", "Zoom in")}
        onClick={() => {
          onZoomIn?.();
          map.zoomIn();
        }}
      >
        <span className="text-lg leading-none">+</span>
      </IconButton>
      <IconButton
        title={t("heatmap.zoomOut", "Zoom out")}
        onClick={() => {
          onZoomOut?.();
          map.zoomOut();
        }}
      >
        <span className="text-lg leading-none">−</span>
      </IconButton>
      <IconButton title={t("heatmap.expandMap", "Expand map")} onClick={() => onExpand?.()}>
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

function ClusteredCasesLayer({ cases, basemapMode }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return undefined;

    const isBW = basemapMode === "bw";
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true
    });

    for (const c of cases || []) {
      if (!Number.isFinite(c?.latitude) || !Number.isFinite(c?.longitude)) continue;

      const isFmd = c.prediction === "FMD";

      // Monochrome mode keeps the heatmap readable even without color.
      const borderColor = isBW ? "#0f172a" : isFmd ? "#dc2626" : "#059669";
      const fillColor = isBW
        ? isFmd
          ? "#0b1220"
          : "#f8fafc"
        : isFmd
          ? "#ef4444"
          : "#10b981";

      const reportBorder = isBW ? "#cbd5e1" : "#cbd5e1";
      const reportBg = isBW ? "#ffffff" : "#ffffff";
      const reportText = isBW ? "#334155" : "#475569";
      const infoBorder = isBW ? "#cbd5e1" : "#34d399";
      const infoBg = isBW ? "#f3f4f6" : "#ecfdf5";
      const infoText = isBW ? "#374151" : "#047857";

      // Use a Leaflet marker with a DivIcon so `leaflet.markercluster` can cluster it.
      const icon = L.divIcon({
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        html: `<div style="width:14px;height:14px;border-radius:9999px;border:2px solid ${borderColor};background:${fillColor};opacity:${isBW ? (isFmd ? 0.55 : 0.9) : 0.6};"></div>`
      });

      const popupHtml = `
        <div style="min-width: 190px;">
          <p style="margin: 0 0 4px 0; font-weight: 600;">${escapeHtml(c?.ownerName)}</p>
          <p style="margin: 0; font-size: 12px;">${escapeHtml(c?.region)}</p>
          <p style="margin: 0; font-size: 12px;">${escapeHtml(c?.prediction)}</p>
          <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" style="border:1px solid ${reportBorder}; background:${reportBg}; color:${reportText}; padding:6px 10px; border-radius:8px; font-weight:600; font-size:12px;">${escapeHtml("Report (mock)")}</button>
            <button type="button" style="border:1px solid ${infoBorder}; background:${infoBg}; color:${infoText}; padding:6px 10px; border-radius:8px; font-weight:700; font-size:12px;">${escapeHtml("More info (mock)")}</button>
          </div>
        </div>
      `;

      const marker = L.marker([c.latitude, c.longitude], { icon });
      marker.bindPopup(popupHtml, { closeButton: false, autoPan: false });

      marker.on("mouseover", function () {
        this.openPopup();
      });
      marker.on("mouseout", function () {
        this.closePopup();
      });
      marker.on("click", function () {
        this.openPopup();
      });

      clusterGroup.addLayer(marker);
    }

    clusterGroup.addTo(map);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, cases, basemapMode]);

  return null;
}

function MapPanel({
  title,
  subtitle,
  legendItems,
  cases,
  expanded,
  onSetExpanded,
  updatedAt,
  basemapMode,
  onSetBasemapMode
}) {
  const { t } = useI18n();
  const [mobileLegendOpen, setMobileLegendOpen] = useState(false);

  return (
    <>
      {expanded ? (
        <button
          type="button"
          onClick={() => onSetExpanded(false)}
          className="fixed inset-0 z-40 bg-slate-900/50"
          aria-label={t("heatmap.closeExpandedBackground", "Close expanded map background")}
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
              {expanded ? t("common.close", "Close") : t("common.expand", "Expand")}
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-4 p-4 sm:p-6 ${expanded ? "lg:grid-cols-1" : "lg:grid-cols-5"}`}>
          <div className={expanded ? "" : "lg:col-span-3"}>
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-3 py-2">
                <p className="text-xs font-medium text-slate-600">
                  {t("heatmap.pointerHelp", "Put your pointer on regions for details")}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileLegendOpen((prev) => !prev)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 lg:hidden"
                  >
                    {mobileLegendOpen ? t("heatmap.hideLegend", "Hide legend") : t("heatmap.showLegend", "Show legend")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetBasemapMode((prev) => (prev === "bw" ? "terrain" : "bw"))}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {basemapMode === "bw"
                      ? t("heatmap.basemapBW", "B/W")
                      : t("heatmap.basemapTerrain", "Terrain")}
                  </button>
                  <p className="text-xs text-slate-500">{t("heatmap.zoomHelp", "Use + / - to zoom")}</p>
                </div>
              </div>

              <div className={expanded ? "h-[calc(100vh-165px)] sm:h-[calc(100vh-170px)]" : "h-[340px] sm:h-[460px] lg:h-[500px]"}>
                <MapContainer
                  center={INDIA_CENTER}
                  zoom={5}
                  minZoom={3}
                  maxZoom={14}
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
                    attribution={
                      basemapMode === "bw"
                        ? '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://opentopomap.org/">OpenTopoMap</a>'
                    }
                    url={
                      basemapMode === "bw"
                        ? "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    }
                    detectRetina={basemapMode === "bw"}
                    maxZoom={14}
                    maxNativeZoom={18}
                  />
                  <MapZoomControls />
                  <MapAutoResize expanded={expanded} />
                  <MapExpandOnZoom onExpand={() => onSetExpanded(true)} />
                  <ClusteredCasesLayer cases={cases} basemapMode={basemapMode} />
                </MapContainer>
              </div>

              {mobileLegendOpen ? (
                <div className="border-t border-slate-200 bg-white p-3 lg:hidden">
                  <Legend title={t("heatmap.colorScale", "Color Scale")} items={legendItems} />
                </div>
              ) : null}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              <span className="font-medium text-slate-700">
                {t("common.updated", "Updated")}: {updatedAt || t("common.na", "N/A")}
              </span>
              {" "}• {t("heatmap.sourceNote", "Source: backend ImageRecord coordinates")}
            </p>
          </div>

          {expanded ? null : (
            <div className="hidden lg:col-span-2 lg:block">
              <Legend title={t("heatmap.colorScale", "Color Scale")} items={legendItems} />
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
  const [basemapMode, setBasemapMode] = useState("bw");

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
              ownerName: item?.report?.ownerName || t("admin.unknownUser", "Unknown user"),
              createdAt: item.createdAt || new Date().toISOString(),
              region: item?.report?.region || t("heatmap.india", "India")
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
        setError(t("heatmap.loadError", "Failed to load live case map data. Please restart backend once and try again."));
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
              {t("heatmap.backDashboard", "Back to Dashboard")}
            </button>
            <div>
              <p className="text-lg font-semibold text-emerald-800">{t("heatmap.title", "India Case Heatmap")}</p>
              <p className="text-xs text-slate-500">
                {t("heatmap.operationalSubtitle", "Operational geospatial monitoring view (live DB-backed data).")}
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
            {t("heatmap.consoleTag", "Monitoring Console")}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
            {t("heatmap.heading", "India FMD Case Map")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t("heatmap.instructions", "Hover or tap a case marker to open quick actions. Zoom to expand map into focused mode.")}
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
              basemapMode={basemapMode}
              onSetBasemapMode={setBasemapMode}
            />
          )}
        </section>
      </main>

    </div>
  );
}
