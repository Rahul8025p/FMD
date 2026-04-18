import { useEffect, useMemo, useState } from "react";
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
const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];
const STATE_VIEW_CENTERS = {
  "Andhra Pradesh": { center: [15.9129, 79.74], zoom: 7 },
  "Arunachal Pradesh": { center: [28.218, 94.7278], zoom: 7 },
  Assam: { center: [26.2006, 92.9376], zoom: 7 },
  Bihar: { center: [25.0961, 85.3131], zoom: 7 },
  Chhattisgarh: { center: [21.2787, 81.8661], zoom: 7 },
  Goa: { center: [15.2993, 74.124], zoom: 9 },
  Gujarat: { center: [22.2587, 71.1924], zoom: 7 },
  Haryana: { center: [29.0588, 76.0856], zoom: 8 },
  "Himachal Pradesh": { center: [31.1048, 77.1734], zoom: 8 },
  Jharkhand: { center: [23.6102, 85.2799], zoom: 8 },
  Karnataka: { center: [15.3173, 75.7139], zoom: 7 },
  Kerala: { center: [10.8505, 76.2711], zoom: 8 },
  "Madhya Pradesh": { center: [22.9734, 78.6569], zoom: 7 },
  Maharashtra: { center: [19.7515, 75.7139], zoom: 7 },
  Manipur: { center: [24.6637, 93.9063], zoom: 8 },
  Meghalaya: { center: [25.467, 91.3662], zoom: 8 },
  Mizoram: { center: [23.1645, 92.9376], zoom: 8 },
  Nagaland: { center: [26.1584, 94.5624], zoom: 8 },
  Odisha: { center: [20.9517, 85.0985], zoom: 7 },
  Punjab: { center: [31.1471, 75.3412], zoom: 8 },
  Rajasthan: { center: [27.0238, 74.2179], zoom: 7 },
  Sikkim: { center: [27.533, 88.5122], zoom: 9 },
  "Tamil Nadu": { center: [11.1271, 78.6569], zoom: 7 },
  Telangana: { center: [18.1124, 79.0193], zoom: 7 },
  Tripura: { center: [23.9408, 91.9882], zoom: 8 },
  "Uttar Pradesh": { center: [26.8467, 80.9462], zoom: 7 },
  Uttarakhand: { center: [30.0668, 79.0193], zoom: 8 },
  "West Bengal": { center: [22.9868, 87.855], zoom: 7 },
  "Andaman and Nicobar Islands": { center: [11.7401, 92.6586], zoom: 7 },
  Chandigarh: { center: [30.7333, 76.7794], zoom: 10 },
  "Dadra and Nagar Haveli and Daman and Diu": { center: [20.3974, 72.8328], zoom: 9 },
  Delhi: { center: [28.7041, 77.1025], zoom: 10 },
  "Jammu and Kashmir": { center: [33.7782, 76.5762], zoom: 7 },
  Ladakh: { center: [34.2996, 78.2932], zoom: 7 },
  Lakshadweep: { center: [10.5667, 72.6417], zoom: 8 },
  Puducherry: { center: [11.9416, 79.8083], zoom: 10 }
};

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

function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function MapZoomControls() {
  const map = useMap();
  const { t } = useI18n();
  const { onZoomIn, onZoomOut } = map.options || {};
  return (
    <div className="absolute bottom-4 right-3 z-[1000] flex flex-col gap-2">
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
    </div>
  );
}

function MapSearchControls({ cases, searchQuery, selectedState, onSearchQueryChange, onSelectedStateChange }) {
  const map = useMap();
  const { t } = useI18n();
  const normalizedQuery = normalizeValue(searchQuery);
  const normalizedState = normalizeValue(selectedState);
  const matchedStateFromQuery = INDIA_STATES.find((stateName) => normalizeValue(stateName) === normalizedQuery);
  const stateFromDropdown = INDIA_STATES.find((stateName) => normalizeValue(stateName) === normalizedState);
  const activeStateName = stateFromDropdown || matchedStateFromQuery || "";
  const effectiveStateFilter =
    normalizedState && normalizedState !== "all"
      ? normalizedState
      : matchedStateFromQuery
        ? normalizeValue(matchedStateFromQuery)
        : "all";

  const filteredCases = useMemo(() => {
    return (cases || []).filter((item) => {
      const stateMatches =
        !effectiveStateFilter ||
        effectiveStateFilter === "all" ||
        normalizeValue(item?.region).includes(effectiveStateFilter);

      if (!stateMatches) return false;
      if (!normalizedQuery || normalizeValue(item?.region).includes(normalizedQuery)) return true;

      const searchable = [
        item?.ownerName,
        item?.region,
        item?.prediction
      ]
        .map((part) => normalizeValue(part))
        .join(" ");

      return searchable.includes(normalizedQuery);
    });
  }, [cases, effectiveStateFilter, normalizedQuery]);

  const focusOnFilteredCases = ({ includeStateFallback = false } = {}) => {
    if (!filteredCases.length) {
      if (includeStateFallback && activeStateName) {
        const preset = STATE_VIEW_CENTERS[activeStateName];
        if (preset) {
          map.setView(preset.center, Math.min(preset.zoom, map.getMaxZoom()));
        }
      }
      return;
    }

    const points = filteredCases
      .filter((item) => Number.isFinite(item?.latitude) && Number.isFinite(item?.longitude))
      .map((item) => [item.latitude, item.longitude]);

    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], Math.min(12, map.getMaxZoom()));
      return;
    }
    map.fitBounds(points, { padding: [34, 34], maxZoom: Math.min(12, map.getMaxZoom()) });
  };

  useEffect(() => {
    focusOnFilteredCases({ includeStateFallback: false });
  }, [filteredCases]);

  return (
    <div className="absolute left-3 right-3 top-3 z-[1000] max-w-[760px] rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          if (matchedStateFromQuery) {
            onSelectedStateChange(matchedStateFromQuery);
          }
          focusOnFilteredCases({ includeStateFallback: true });
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder={t("heatmap.searchPlaceholder", "Search places, owner, state, or status")}
          className="w-full min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:min-w-[220px]"
        />
        <select
          value={selectedState}
          onChange={(event) => onSelectedStateChange(event.target.value)}
          className="w-full rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:w-auto sm:min-w-[190px]"
        >
          <option value="all">{t("heatmap.allStates", "All states")}</option>
          {INDIA_STATES.map((stateName) => (
            <option key={stateName} value={stateName}>
              {stateName}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            type="submit"
            className="flex-1 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:flex-none"
          >
            {t("common.search", "Search")}
          </button>
          <button
            type="button"
            onClick={() => {
              onSearchQueryChange("");
              onSelectedStateChange("all");
              map.fitBounds(INDIA_BOUNDS, { padding: [20, 20] });
            }}
            className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:flex-none"
          >
            {t("common.reset", "Reset")}
          </button>
        </div>
      </form>
      <div className="mt-2 px-1">
        <p className="text-[11px] text-slate-500">
          {t("heatmap.matchingPins", "Matching pins")}: {filteredCases.length}
        </p>
      </div>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const isBW = basemapMode === "bw";
  const mapMaxZoom = isBW ? 18 : 13;
  const mapMinZoom = 4;

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
                  minZoom={mapMinZoom}
                  maxZoom={mapMaxZoom}
                  maxBounds={INDIA_BOUNDS}
                  maxBoundsViscosity={0.8}
                  zoomControl={false}
                  className="h-full w-full"
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
                    maxZoom={mapMaxZoom}
                    maxNativeZoom={isBW ? 18 : 13}
                  />
                  <MapSearchControls
                    cases={cases}
                    searchQuery={searchQuery}
                    selectedState={selectedState}
                    onSearchQueryChange={setSearchQuery}
                    onSelectedStateChange={setSelectedState}
                  />
                  <MapZoomControls />
                  <MapAutoResize expanded={expanded} />
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
