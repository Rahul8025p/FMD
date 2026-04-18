import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useI18n } from "../i18n/I18nProvider";
import PageFooter from "../components/PageFooter";

export default function History() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [predictionFilter, setPredictionFilter] = useState("ALL");
  const [feverFilter, setFeverFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("DESC"); // createdAt
  const [page, setPage] = useState(1);
  const pageSize = 25;

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
        setError(t("history.loadError", "Unable to load detection history."));
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [navigate]);

  useEffect(() => {
    setPage(1);
  }, [predictionFilter, feverFilter, sortOrder]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (
          predictionFilter !== "ALL" &&
          (item?.prediction || "").toUpperCase() !== predictionFilter
        ) {
          return false;
        }
        if (feverFilter !== "ALL") {
          const feverValue =
            item?.fever === true ? "YES" : item?.fever === false ? "NO" : null;
          if (!feverValue) return false;
          if (feverValue !== feverFilter) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return sortOrder === "DESC" ? tb - ta : ta - tb;
      });
  }, [feverFilter, items, predictionFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return filteredItems.slice(startIdx, startIdx + pageSize);
  }, [filteredItems, page]);

  const fmdCount = filteredItems.filter((x) => (x.prediction || "") === "FMD")
    .length;
  const healthyCount = filteredItems.filter(
    (x) => (x.prediction || "") === "Healthy"
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-lime-50 via-emerald-50 to-white px-4 py-6 sm:px-6 md:py-10">
      <div className="mx-auto max-w-6xl flex-1 space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t("history.recordsTag", "Detection Records")}
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-800 sm:text-3xl">
                {t("history.title", "History")}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {t("history.subtitle", "Previous uploaded cases with prediction and date/time.")}
              </p>
            </div>
            <button
              onClick={() => navigate("/user")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t("history.backDashboard", "Back to dashboard")}
            </button>
          </div>

          {/* Search + filters */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {t("history.prediction", "Prediction")}
              </label>
              <select
                value={predictionFilter}
                onChange={(e) => setPredictionFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="ALL">{t("common.all", "All")}</option>
                <option value="FMD">FMD</option>
                <option value="HEALTHY">{t("admin.healthyCases", "Healthy")}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {t("history.fever", "Fever")}
              </label>
              <select
                value={feverFilter}
                onChange={(e) => setFeverFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="ALL">{t("common.all", "All")}</option>
                <option value="YES">{t("common.yes", "Yes")}</option>
                <option value="NO">{t("common.no", "No")}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {t("history.sort", "Sort")}
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="DESC">{t("history.newestFirst", "Newest first")}</option>
                <option value="ASC">{t("history.oldestFirst", "Oldest first")}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("history.results", "Results")}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {t("history.showing", "Showing")}{" "}
                  <span className="font-semibold">{paginatedItems.length}</span>{" "}
                  {t("history.of", "of")}{" "}
                  <span className="font-semibold">{filteredItems.length}</span>{" "}
                  {t("history.detections", "detections")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart: FMD vs Healthy */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            {t("history.fmdVsHealthy", "FMD vs Healthy")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t("history.filteredHelp", `Based on your current filters (${filteredItems.length} records).`)}
          </p>
          <div className="mt-4 flex items-end justify-start gap-4">
            {[
              { label: "FMD", value: fmdCount, bg: "bg-red-600" },
              { label: t("admin.healthyCases", "Healthy"), value: healthyCount, bg: "bg-emerald-600" }
            ].map((bar) => {
              const max = Math.max(fmdCount, healthyCount, 1);
              const heightPct = (bar.value / max) * 100;
              return (
                <div key={bar.label} className="w-24 text-center">
                  <div className="mx-auto h-32 rounded-lg bg-slate-50 flex items-end justify-center p-2">
                    <div
                      className={`w-full rounded-lg ${bar.bg} transition-all`}
                      style={{ height: `${Math.max(8, heightPct)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    {bar.label}
                  </p>
                  <p className="text-xs text-slate-500">{bar.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        ) : null}

        {!loading && !error && filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">{t("history.noFilteredRecords", "No records match your filters.")}</p>
            <button
              onClick={() => {
                setPredictionFilter("ALL");
                setFeverFilter("ALL");
                setSortOrder("DESC");
              }}
              className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              {t("history.resetFilters", "Reset filters")}
            </button>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && !error && filteredItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedItems.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Prediction badge */}
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                      {item?.prediction || t("common.na", "N/A")}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-slate-600">
                      {t("result.confidence", "Confidence")}:{" "}
                      {typeof item.confidence === "number"
                        ? `${(item.confidence * 100).toFixed(2)}%`
                        : t("common.na", "N/A")}
                    </p>
                    <p className="text-sm text-slate-600">
                      {t("history.fever", "Fever")}:{" "}
                      {item.fever === true ? t("common.yes", "Yes") : item.fever === false ? t("common.no", "No") : t("common.na", "N/A")}
                    </p>
                    <p className="text-sm text-slate-600">
                      {t("history.dateTime", "Date/Time")}:{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : t("common.na", "N/A")}
                    </p>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    {t("history.imageStored", "Image stored")}: {item.imageUrl ? t("common.yes", "Yes") : t("common.no", "No")}
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-sm text-slate-600">
                {t("history.page", "Page")}{" "}
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
                  {t("common.prev", "Prev")}
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page === totalPages}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  {t("common.next", "Next")}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
      <PageFooter variant="user" />
    </div>
  );
}

