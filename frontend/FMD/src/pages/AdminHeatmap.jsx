import { useEffect, useMemo, useRef, useState } from "react";
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
import { useI18n } from "../i18n/I18nProvider";
import PageFooter from "../components/PageFooter";

const INDIA_CENTER = [22.9734, 78.6569];
const INDIA_BOUNDS = [
  [6, 68],
  [38.5, 97.5]
];
const INDIA_LAT_MIN = INDIA_BOUNDS[0][0];
const INDIA_LNG_MIN = INDIA_BOUNDS[0][1];
const INDIA_LAT_MAX = INDIA_BOUNDS[1][0];
const INDIA_LNG_MAX = INDIA_BOUNDS[1][1];
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

const STATE_SEVERITY_CONFIG = {
  critical: { label: "Critical", tone: "bg-red-100 text-red-700 border-red-200", ring: "ring-red-100" },
  high: { label: "High", tone: "bg-orange-100 text-orange-700 border-orange-200", ring: "ring-orange-100" },
  moderate: { label: "Moderate", tone: "bg-amber-100 text-amber-700 border-amber-200", ring: "ring-amber-100" },
  low: { label: "Low", tone: "bg-emerald-100 text-emerald-700 border-emerald-200", ring: "ring-emerald-100" }
};

function getSeverityFromRatio(ratio) {
  if (ratio >= 0.23) return "critical";
  if (ratio >= 0.18) return "high";
  if (ratio >= 0.12) return "moderate";
  return "low";
}

const STATE_MOCK_SUMMARY = INDIA_STATES.map((stateName, index) => {
  const affectedCows = 68 + ((index * 37) % 450);
  const totalCows = affectedCows + 720 + ((index * 59) % 1300);
  const severity = getSeverityFromRatio(affectedCows / totalCows);

  return {
    state: stateName,
    affectedCows,
    totalCows,
    unaffectedCows: totalCows - affectedCows,
    severity,
    severityLabel: STATE_SEVERITY_CONFIG[severity].label
  };
});

const STATE_MOCK_CASES = STATE_MOCK_SUMMARY.flatMap((stateData, index) => {
  const center = STATE_VIEW_CENTERS[stateData.state]?.center || INDIA_CENTER;
  const markerCount = 4 + (index % 4);
  const fmdShare = stateData.affectedCows / stateData.totalCows;
  const fmdCount = Math.max(1, Math.round(markerCount * fmdShare));
  const districtPool = ["North", "Central", "South", "East", "West"];

  return Array.from({ length: markerCount }, (_, markerIndex) => {
    const isFmd = markerIndex < fmdCount;
    const latJitter = ((markerIndex % 3) - 1) * 0.28 + ((index % 5) - 2) * 0.05;
    const lngJitter = (((markerIndex + 1) % 3) - 1) * 0.26 + ((index % 7) - 3) * 0.04;
    const latitude = Math.max(INDIA_LAT_MIN, Math.min(INDIA_LAT_MAX, center[0] + latJitter));
    const longitude = Math.max(INDIA_LNG_MIN, Math.min(INDIA_LNG_MAX, center[1] + lngJitter));

    const markerTotalCows = Math.max(
      5,
      Math.round((isFmd ? stateData.affectedCows : stateData.unaffectedCows) / markerCount)
    );
    // Small deterministic variation so totals don't look uniform.
    const maleRatioBase = 0.52;
    const maleRatioDrift = (((index + markerIndex) % 5) - 2) * 0.02; // -0.04 .. +0.04
    const maleRatio = Math.max(0.42, Math.min(0.6, maleRatioBase + maleRatioDrift));
    const maleCount = Math.max(0, Math.round(markerTotalCows * maleRatio));
    const femaleCount = Math.max(0, markerTotalCows - maleCount);

    const district =
      `${districtPool[(index + markerIndex) % districtPool.length]} ` +
      `District ${((markerIndex + 1) % 6) + 1}`;

    return {
      id: `mock-${index + 1}-${markerIndex + 1}`,
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      prediction: isFmd ? "FMD" : "Healthy",
      ownerName: `${stateData.state} Livestock Cluster ${markerIndex + 1}`,
      createdAt: new Date(Date.now() - (index * 6 + markerIndex) * 3600000).toISOString(),
      region: stateData.state,
      district,
      maleCount,
      femaleCount
    };
  });
});

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

function resolveStateFromQuery(searchQuery) {
  const normalizedQuery = normalizeValue(searchQuery);
  if (!normalizedQuery) return "";

  const exactMatch = INDIA_STATES.find((stateName) => normalizeValue(stateName) === normalizedQuery);
  if (exactMatch) return exactMatch;

  const partialMatch = INDIA_STATES.find((stateName) =>
    normalizeValue(stateName).includes(normalizedQuery)
  );
  return partialMatch || "";
}

function computeFilteredCases(cases, searchQuery, selectedState) {
  const normalizedQuery = normalizeValue(searchQuery);
  const normalizedState = normalizeValue(selectedState);
  const matchedStateFromQuery = resolveStateFromQuery(searchQuery);
  const effectiveStateFilter =
    normalizedState && normalizedState !== "all"
      ? normalizedState
      : matchedStateFromQuery
        ? normalizeValue(matchedStateFromQuery)
        : "all";

  return (cases || []).filter((item) => {
    const stateMatches =
      !effectiveStateFilter ||
      effectiveStateFilter === "all" ||
      normalizeValue(item?.region).includes(effectiveStateFilter);

    if (!stateMatches) return false;
    if (!normalizedQuery || normalizeValue(item?.region).includes(normalizedQuery)) return true;

    const searchable = [item?.ownerName, item?.region, item?.prediction]
      .map((part) => normalizeValue(part))
      .join(" ");

    return searchable.includes(normalizedQuery);
  });
}

function focusMapFromFilter(map, filteredCases, { stateLabel, useStateFallback }) {
  const points = filteredCases
    .filter((item) => Number.isFinite(item?.latitude) && Number.isFinite(item?.longitude))
    .map((item) => [item.latitude, item.longitude]);

  if (points.length === 1) {
    map.setView(points[0], Math.min(12, map.getMaxZoom()));
    return true;
  }
  if (points.length > 1) {
    map.fitBounds(points, { padding: [34, 34], maxZoom: Math.min(12, map.getMaxZoom()) });
    return true;
  }
  if (useStateFallback && stateLabel && STATE_VIEW_CENTERS[stateLabel]) {
    const preset = STATE_VIEW_CENTERS[stateLabel];
    map.setView(preset.center, Math.min(preset.zoom, map.getMaxZoom()));
    return true;
  }
  return false;
}

async function geocodePlaceIndia(query) {
  const q = query.trim();
  if (!q) return null;

  const bbox = "68.0,6.0,97.5,38.5";
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1&lang=en&bbox=${bbox}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const f = data?.features?.[0];
  if (!f?.geometry?.coordinates) return null;
  const [lon, lat] = f.geometry.coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const props = f.properties || {};
  const t = props.type;
  let zoom = 11;
  if (t === "state") zoom = 7;
  else if (t === "county") zoom = 8;
  else if (t === "district") zoom = 9;
  else if (t === "city") zoom = 11;
  else if (t === "town") zoom = 12;
  else if (t === "village" || t === "hamlet") zoom = 13;
  else if (t === "locality" || t === "neighbourhood") zoom = 13;

  const label = props.name || q;
  return { lat, lon, zoom, label };
}

function MapLeafletRefBridge({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

function MapLiveFocus({ filteredCases }) {
  const map = useMap();
  useEffect(() => {
    const points = filteredCases
      .filter((item) => Number.isFinite(item?.latitude) && Number.isFinite(item?.longitude))
      .map((item) => [item.latitude, item.longitude]);
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], Math.min(12, map.getMaxZoom()));
      return;
    }
    map.fitBounds(points, { padding: [34, 34], maxZoom: Math.min(12, map.getMaxZoom()) });
  }, [filteredCases, map]);
  return null;
}

function MapZoomControls({ expanded, onToggleExpand }) {
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
      <IconButton
        title={expanded ? t("common.close", "Close") : t("common.expand", "Expand")}
        onClick={onToggleExpand}
      >
        <span className="text-base leading-none">{expanded ? "⤡" : "⤢"}</span>
      </IconButton>
    </div>
  );
}

function MapSearchBar({
  mapRef,
  cases,
  searchQuery,
  selectedState,
  onSearchQueryChange,
  onSelectedStateChange,
  filteredCases,
  expanded
}) {
  const { t } = useI18n();
  const [placeStatus, setPlaceStatus] = useState("idle");
  const [placeDetail, setPlaceDetail] = useState("");

  const matchedStateFromQuery = resolveStateFromQuery(searchQuery);
  const stats = useMemo(() => {
    const totals = {
      total: filteredCases.length,
      fmd: 0,
      notFmd: 0
    };
    for (const item of filteredCases) {
      if (item?.prediction === "FMD") totals.fmd += 1;
      else totals.notFmd += 1;
    }
    return totals;
  }, [filteredCases]);
  const selectedStateKey =
    selectedState && normalizeValue(selectedState) !== "all"
      ? selectedState
      : matchedStateFromQuery || "";
  const selectedStateInsight = useMemo(() => {
    if (!selectedStateKey) return null;
    const stateCases = (cases || []).filter(
      (item) => normalizeValue(item?.region) === normalizeValue(selectedStateKey)
    );
    if (!stateCases.length) return null;

    const affectedCows = stateCases.filter((item) => item?.prediction === "FMD").length;
    const totalCows = stateCases.length;
    const unaffectedCows = totalCows - affectedCows;
    const severity = getSeverityFromRatio(totalCows ? affectedCows / totalCows : 0);

    return {
      state: selectedStateKey,
      affectedCows,
      totalCows,
      unaffectedCows,
      severity,
      severityLabel: STATE_SEVERITY_CONFIG[severity].label
    };
  }, [cases, selectedStateKey]);
  const selectedSeverityConfig = selectedStateInsight
    ? STATE_SEVERITY_CONFIG[selectedStateInsight.severity]
    : null;

  return (
    <div
      className={`w-full shrink-0 ${
        expanded
          ? "border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white pb-3 sm:pb-4"
          : "mb-3 sm:mb-4"
      }`}
    >
      <div
        className={`mx-auto w-full rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5 ring-1 ring-slate-900/[0.04] ${
          expanded ? "max-w-5xl" : "max-w-4xl"
        }`}
      >
        {expanded ? (
          <p className="border-b border-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-4">
            {t("heatmap.searchOutsideHint", "Search & filter map")}
          </p>
        ) : null}
        <form
          className="flex flex-col gap-2.5 p-2.5 sm:flex-row sm:items-center sm:gap-2 sm:p-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setPlaceDetail("");
            const map = mapRef.current;
            const trimmed = searchQuery.trim();
            if (matchedStateFromQuery) {
              onSelectedStateChange(matchedStateFromQuery);
            }
            const nextSelectedState = matchedStateFromQuery || selectedState;
            const syncedFiltered = computeFilteredCases(cases, searchQuery, nextSelectedState);
            const stateLabelForFallback =
              nextSelectedState && normalizeValue(nextSelectedState) !== "all"
                ? nextSelectedState
                : matchedStateFromQuery || "";

            if (!map) {
              setPlaceStatus("idle");
              return;
            }

            const moved = focusMapFromFilter(map, syncedFiltered, {
              stateLabel: stateLabelForFallback,
              useStateFallback: true
            });

            if (moved) {
              setPlaceStatus("idle");
              return;
            }

            if (!trimmed) {
              setPlaceStatus("idle");
              return;
            }

            setPlaceStatus("loading");
            try {
              const geo = await geocodePlaceIndia(trimmed);
              if (!mapRef.current) {
                setPlaceStatus("idle");
                return;
              }
              if (geo) {
                mapRef.current.setView([geo.lat, geo.lon], Math.min(geo.zoom, mapRef.current.getMaxZoom()));
                setPlaceStatus("ok");
                setPlaceDetail(geo.label);
              } else {
                setPlaceStatus("error");
                setPlaceDetail(
                  t("heatmap.placeNotFound", "No matching place found in India. Try another spelling.")
                );
              }
            } catch {
              setPlaceStatus("error");
              setPlaceDetail(
                t("heatmap.placeSearchFailed", "Place search unavailable. Check your connection and try again.")
              );
            }
          }}
        >
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                onSearchQueryChange(event.target.value);
                setPlaceStatus("idle");
                setPlaceDetail("");
              }}
              placeholder={t(
                "heatmap.searchPlaceholder",
                "Search city, village, owner, state, or status"
              )}
              className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              autoComplete="off"
            />
          </div>
          <select
            value={selectedState}
            onChange={(event) => {
              onSelectedStateChange(event.target.value);
              setPlaceStatus("idle");
              setPlaceDetail("");
            }}
            className="w-full shrink-0 rounded-full border border-slate-200 bg-slate-50/80 py-2.5 pl-3 pr-8 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:w-[min(42vw,220px)] md:w-56"
          >
            <option value="all">{t("heatmap.allStates", "All states")}</option>
            {INDIA_STATES.map((stateName) => (
              <option key={stateName} value={stateName}>
                {stateName}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-center gap-2 sm:ml-auto sm:justify-end">
            <button
              type="submit"
              disabled={placeStatus === "loading"}
              className="inline-flex min-h-[40px] min-w-[40px] flex-1 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
            >
              {placeStatus === "loading"
                ? t("heatmap.searching", "Searching…")
                : t("common.search", "Search")}
            </button>
            <button
              type="button"
              onClick={() => {
                onSearchQueryChange("");
                onSelectedStateChange("all");
                setPlaceStatus("idle");
                setPlaceDetail("");
                mapRef.current?.fitBounds(INDIA_BOUNDS, { padding: [20, 20] });
              }}
              className="inline-flex min-h-[40px] min-w-[40px] flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 sm:flex-none"
            >
              {t("common.reset", "Reset")}
            </button>
          </div>
        </form>
        {selectedStateInsight ? (
          <div className="border-t border-slate-100 px-3 py-3 sm:px-4">
            <div
              className={`rounded-xl border bg-white p-3 shadow-sm ring-1 ${selectedSeverityConfig?.ring || "ring-slate-100"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{selectedStateInsight.state}</p>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${selectedSeverityConfig?.tone || "bg-slate-100 text-slate-700 border-slate-200"}`}
                >
                  {selectedStateInsight.severityLabel} severity
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-red-700">Affected cows</p>
                  <p className="mt-1 text-base font-semibold text-red-800">{selectedStateInsight.affectedCows}</p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-700">Unaffected cows</p>
                  <p className="mt-1 text-base font-semibold text-emerald-800">
                    {selectedStateInsight.unaffectedCows}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Total cows tracked</p>
                  <p className="mt-1 text-base font-semibold text-slate-800">{selectedStateInsight.totalCows}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div className="border-t border-slate-100 px-3 py-2 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <p className="font-medium text-slate-500">
              {t("heatmap.matchingPins", "Matching pins")}:{" "}
              <span className="text-slate-800">{stats.total}</span>
            </p>
            {stats.total === 0 && (searchQuery.trim() || normalizeValue(selectedState) !== "all") ? (
              <p className="text-amber-700">
                {t("heatmap.noMatches", "No markers match your current search/filter.")}
              </p>
            ) : null}
            {placeStatus === "ok" && placeDetail ? (
              <p className="text-emerald-700">
                {t("heatmap.placeLocated", "Showing")}: <span className="font-semibold">{placeDetail}</span>
              </p>
            ) : null}
            {placeStatus === "error" && placeDetail ? (
              <p className="max-w-[min(100%,20rem)] text-right text-amber-800">{placeDetail}</p>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-stretch gap-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
              <p className="text-[11px] text-red-600">{t("admin.fmdFlagged", "FMD")}</p>
              <p className="text-sm font-semibold text-red-700">{stats.fmd}</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-2">
              <p className="text-[11px] text-emerald-700">{t("heatmap.notFmdCases", "Not FMD")}</p>
              <p className="text-sm font-semibold text-emerald-700">{stats.notFmd}</p>
            </div>
            <div className="ml-auto rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-right">
              <p className="text-[11px] text-slate-500">{t("heatmap.totalPlotted", "Total plotted cases")}</p>
              <p className="text-sm font-semibold text-slate-800">{stats.total}</p>
            </div>
          </div>
        </div>
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

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true
    });

    for (const c of cases || []) {
      if (!Number.isFinite(c?.latitude) || !Number.isFinite(c?.longitude)) continue;

      const isFmd = c.prediction === "FMD";

      const borderColor = isFmd ? "#dc2626" : "#059669";
      const fillColor = isFmd ? "#ef4444" : "#10b981";

      const reportBorder = "#cbd5e1";
      const reportBg = "#ffffff";
      const reportText = "#475569";
      const infoBorder = "#34d399";
      const infoBg = "#ecfdf5";
      const infoText = "#047857";

      // Use a Leaflet marker with a DivIcon so `leaflet.markercluster` can cluster it.
      const icon = L.divIcon({
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        html: `<div style="width:14px;height:14px;border-radius:9999px;border:2px solid ${borderColor};background:${fillColor};opacity:0.72;"></div>`
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
  const mapRef = useRef(null);
  const filteredCases = useMemo(
    () => computeFilteredCases(cases, searchQuery, selectedState),
    [cases, searchQuery, selectedState]
  );
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
          expanded
            ? "fixed inset-2 z-50 flex max-h-[calc(100dvh-1rem)] min-h-0 flex-col overflow-hidden sm:inset-3"
            : ""
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

        <div
          className={
            expanded
              ? "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6"
              : "grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-5"
          }
        >
          <div
            className={`flex min-h-0 flex-col ${expanded ? "min-h-0 flex-1" : "lg:col-span-3"}`}
          >
            <MapSearchBar
              mapRef={mapRef}
              cases={cases}
              searchQuery={searchQuery}
              selectedState={selectedState}
              onSearchQueryChange={setSearchQuery}
              onSelectedStateChange={setSelectedState}
              filteredCases={filteredCases}
              expanded={expanded}
            />
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
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

              <div
                className={
                  expanded
                    ? "min-h-[260px] flex-1 sm:min-h-[320px]"
                    : "h-[340px] sm:h-[460px] lg:h-[500px]"
                }
              >
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
                  <MapLeafletRefBridge mapRef={mapRef} />
                  <MapLiveFocus filteredCases={filteredCases} />
                  <MapZoomControls
                    expanded={expanded}
                    onToggleExpand={() => onSetExpanded((prev) => !prev)}
                  />
                  <MapAutoResize expanded={expanded} />
                  <ClusteredCasesLayer cases={filteredCases} basemapMode={basemapMode} />
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
  const [cases] = useState(STATE_MOCK_CASES);
  const [lastUpdatedAt] = useState(() => new Date().toLocaleString());

  const [selectedState, setSelectedState] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const years = useMemo(() => {
    const set = new Set(
      (cases || []).map((c) => {
        const d = new Date(c?.createdAt);
        return Number.isFinite(d?.getFullYear?.()) ? d.getFullYear() : null;
      })
    );
    const out = Array.from(set).filter((x) => typeof x === "number").sort((a, b) => b - a);
    return out.length ? out : [new Date().getFullYear()];
  }, [cases]);
  const [selectedYear, setSelectedYear] = useState(() => years[0] ?? new Date().getFullYear());

  useEffect(() => {
    if (!years.includes(selectedYear)) setSelectedYear(years[0]);
  }, [selectedYear, years]);

  const districtOptions = useMemo(() => {
    const from = (cases || []).filter((c) => selectedState === "all" || normalizeValue(c?.region) === normalizeValue(selectedState));
    const unique = Array.from(new Set(from.map((c) => c?.district).filter(Boolean)));
    unique.sort((a, b) => String(a).localeCompare(String(b)));
    return unique;
  }, [cases, selectedState]);

  const filteredCases = useMemo(() => {
    const stateNorm = normalizeValue(selectedState);
    const districtNorm = normalizeValue(selectedDistrict);
    const yearNum = Number(selectedYear);

    return (cases || []).filter((c) => {
      const regionNorm = normalizeValue(c?.region);
      const districtNormValue = normalizeValue(c?.district);
      const createdYear = new Date(c?.createdAt).getFullYear();

      const stateOk = selectedState === "all" || regionNorm === stateNorm;
      const districtOk = selectedDistrict === "all" || districtNormValue === districtNorm;
      const yearOk = Number.isFinite(yearNum) && createdYear === yearNum;

      return stateOk && districtOk && yearOk;
    });
  }, [cases, selectedDistrict, selectedState, selectedYear]);

  const numberFmt = useMemo(() => new Intl.NumberFormat(undefined), []);

  const totals = useMemo(() => {
    let total = 0;
    let male = 0;
    let female = 0;
    let fmd = 0;
    for (const c of filteredCases) {
      total += (c?.maleCount || 0) + (c?.femaleCount || 0);
      male += c?.maleCount || 0;
      female += c?.femaleCount || 0;
      if (c?.prediction === "FMD") fmd += (c?.maleCount || 0) + (c?.femaleCount || 0);
    }
    return { total, male, female, fmd };
  }, [filteredCases]);

  const stateAggRows = useMemo(() => {
    const map = new Map();
    for (const c of filteredCases) {
      const key = c?.region || "Unknown";
      if (!map.has(key)) {
        map.set(key, {
          region: key,
          total: 0,
          male: 0,
          female: 0,
          fmdTotal: 0
        });
      }
      const row = map.get(key);
      const rowTotal = (c?.maleCount || 0) + (c?.femaleCount || 0);
      row.total += rowTotal;
      row.male += c?.maleCount || 0;
      row.female += c?.femaleCount || 0;
      if (c?.prediction === "FMD") row.fmdTotal += rowTotal;
    }

    const rows = Array.from(map.values());
    // Keep it consistent with the India state order.
    const order = new Map(INDIA_STATES.map((s, idx) => [s, idx]));
    rows.sort((a, b) => (order.get(a.region) ?? 9999) - (order.get(b.region) ?? 9999));
    return rows;
  }, [filteredCases]);

  const severityLegendItems = useMemo(() => {
    const severityCounts = { critical: 0, high: 0, moderate: 0, low: 0 };
    for (const row of stateAggRows) {
      const ratio = row.total ? row.fmdTotal / row.total : 0;
      const sev = getSeverityFromRatio(ratio);
      severityCounts[sev] += 1;
    }

    return [
      { label: STATE_SEVERITY_CONFIG.critical.label, swatch: "bg-red-500", count: severityCounts.critical },
      { label: STATE_SEVERITY_CONFIG.high.label, swatch: "bg-orange-500", count: severityCounts.high },
      { label: STATE_SEVERITY_CONFIG.moderate.label, swatch: "bg-amber-500", count: severityCounts.moderate },
      { label: STATE_SEVERITY_CONFIG.low.label, swatch: "bg-emerald-500", count: severityCounts.low }
    ];
  }, [stateAggRows]);

  // Map markers dataset follows the same filter set.
  const mapCases = filteredCases;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
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
              <p className="text-lg font-semibold text-[#003366]">{t("heatmap.title", "India Case Heatmap")}</p>
              <p className="text-xs text-slate-500">
                {t("heatmap.operationalSubtitle", "Operational geospatial monitoring view (mock data).")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              navigate("/admin/login");
            }}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            {t("common.logout", "Logout")}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 md:py-8">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Left panel: filters + stats + table */}
          <section className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#003366]">
                {t("heatmap.consoleTag", "Monitoring Console")}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
                {t("heatmap.heading", "India FMD Case Dashboard")}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {t(
                  "heatmap.instructions",
                  "Use filters to view mock incidence totals by area. Map shows corresponding cases."
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    {t("heatmap.stateLabel", "State")}
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict("all");
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-[#003366]"
                  >
                    <option value="all">{t("common.all", "All states")}</option>
                    {INDIA_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    {t("heatmap.districtLabel", "District")}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-[#003366]"
                  >
                    <option value="all">{t("common.all", "All districts")}</option>
                    {districtOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    {t("heatmap.yearLabel", "Calendar Year")}
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-[#003366]"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <p>
                  <span className="font-medium text-slate-700">{t("common.updated", "Updated")}:</span>{" "}
                  {lastUpdatedAt || t("common.na", "N/A")}
                </p>
                <p>
                  <span className="font-medium text-slate-700">{t("heatmap.sourceNote", "Source")}:</span> Mock
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-slate-500">{t("heatmap.totalLabel", "Total")}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{numberFmt.format(totals.total)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-slate-500">{t("heatmap.maleLabel", "Total Male")}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{numberFmt.format(totals.male)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-slate-500">{t("heatmap.femaleLabel", "Total Female")}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{numberFmt.format(totals.female)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{t("heatmap.areaDetails", "Area Details")}</p>
                <p className="text-xs text-slate-500">
                  {t("heatmap.rowCount", "Rows")}: {stateAggRows.length}
                </p>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                      <th className="px-3 py-2 text-left">{t("heatmap.stateCol", "State")}</th>
                      <th className="px-3 py-2 text-right">{t("heatmap.totalCol", "Total")}</th>
                      <th className="px-3 py-2 text-right">{t("heatmap.maleCol", "Male")}</th>
                      <th className="px-3 py-2 text-right">{t("heatmap.femaleCol", "Female")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateAggRows.length ? (
                      stateAggRows.map((row) => (
                        <tr key={row.region} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-medium text-slate-700">{row.region}</td>
                          <td className="px-3 py-2 text-right text-slate-800">
                            {numberFmt.format(row.total)}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-800">
                            {numberFmt.format(row.male)}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-800">
                            {numberFmt.format(row.female)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-3 py-4 text-sm text-slate-500" colSpan={4}>
                          {t("heatmap.noData", "No mock data for the selected filters.")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Right panel: map + legend */}
          <section className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#003366]">
                    {t("heatmap.mapTag", "Map View")}
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {t("heatmap.mapHeading", "Corresponding cases on India map")}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {t(
                      "heatmap.mapHelp",
                      "Markers are mock case points. Filter settings also drive this dataset."
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {t("heatmap.currentSelection", "Selection")}:
                  </span>{" "}
                  {selectedState === "all" ? "All States" : selectedState} •{" "}
                  {selectedDistrict === "all" ? "All Districts" : selectedDistrict} •{" "}
                  {selectedYear}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <div className="h-[420px] w-full overflow-hidden rounded-lg sm:h-[520px] md:h-[620px]">
                  <MapContainer
                    center={INDIA_CENTER}
                    zoom={5}
                    minZoom={4}
                    maxZoom={12}
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
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      }
                      url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    />
                    <ClusteredCasesLayer cases={mapCases} basemapMode="bw" />
                  </MapContainer>
                </div>
              </div>

              <div className="mt-4">
                <Legend title={t("heatmap.colorScale", "Severity scale")} items={severityLegendItems} />
              </div>
            </div>
          </section>
        </div>
      </main>

      <PageFooter variant="admin" />
    </div>
  );
}
