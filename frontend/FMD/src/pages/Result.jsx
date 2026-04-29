import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useI18n } from "../i18n/I18nProvider";
import PageFooter from "../components/PageFooter";
import { api } from "../services/api";
import { translateTexts } from "../services/runtimeTranslation";

function resolveImageUrl(imageUrl, backendHost) {
  const raw = String(imageUrl || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `http:${raw}`;
  return `${backendHost}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useI18n();
  const backendHost = (api.defaults.baseURL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  const reportRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [liveData, setLiveData] = useState(null);
  const [translatedDynamicText, setTranslatedDynamicText] = useState(null);
  const recordIdFromQuery = searchParams.get("recordId");

  useEffect(() => {
    const loadLiveResult = async () => {
      if (!recordIdFromQuery) return;
      try {
        setLoading(true);
        setFetchError("");
        const res = await api.get(`/user/result/${encodeURIComponent(recordIdFromQuery)}`);
        setLiveData(res.data || null);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        setFetchError(
          err?.response?.data?.message ||
            t("result.loadFailed", "Failed to load real-time result details.")
        );
      } finally {
        setLoading(false);
      }
    };

    loadLiveResult();
  }, [navigate, recordIdFromQuery, t]);

  const resolvedPayload = liveData || state || null;
  const resolvedResult = resolvedPayload?.result || null;
  const uploadedImage = resolveImageUrl(
    resolvedPayload?.imageUrl || state?.imageUrl || state?.uploadedImage,
    backendHost
  );

  useEffect(() => {
    const translateDynamicPayloadText = async () => {
      if (!resolvedResult) {
        setTranslatedDynamicText(null);
        return;
      }

      const visual = resolvedResult?.explanation?.visual || [];
      const texture = resolvedResult?.explanation?.texture || [];
      const thermal = resolvedResult?.explanation?.thermal || [];
      const precautions = resolvedResult?.recommendations?.precautions || [];
      const treatment = resolvedResult?.recommendations?.treatment || [];
      const vaccination = resolvedResult?.recommendations?.vaccination || "";

      const allTexts = [
        ...visual,
        ...texture,
        ...thermal,
        ...precautions,
        ...treatment,
        vaccination
      ].filter(Boolean);

      if (allTexts.length === 0 || language === "en") {
        setTranslatedDynamicText({
          visual,
          texture,
          thermal,
          precautions,
          treatment,
          vaccination
        });
        return;
      }

      try {
        const translations = await translateTexts(language, allTexts);
        const mapText = (value) => translations[value] || value;
        setTranslatedDynamicText({
          visual: visual.map(mapText),
          texture: texture.map(mapText),
          thermal: thermal.map(mapText),
          precautions: precautions.map(mapText),
          treatment: treatment.map(mapText),
          vaccination: vaccination ? mapText(vaccination) : ""
        });
      } catch {
        setTranslatedDynamicText({
          visual,
          texture,
          thermal,
          precautions,
          treatment,
          vaccination
        });
      }
    };

    translateDynamicPayloadText();
  }, [resolvedResult, language]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc]">
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
        <PageFooter variant="user" />
      </div>
    );
  }

  if (!resolvedResult) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc]">
        <div className="flex flex-1 items-center px-4 py-10 sm:px-6">
          <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-slate-600">
              {fetchError || t("result.notFound", "No analysis result found.")}
            </p>
            <button
              className="mt-4 rounded-lg bg-[#003366] px-4 py-2 font-medium text-white transition hover:bg-[#002a4d]"
              onClick={() => navigate("/analyze")}
            >
              {t("result.goAnalyze", "Go to Analyze")}
            </button>
          </div>
        </div>
        <PageFooter variant="user" />
      </div>
    );
  }

  const { disease, confidence, severity, explanation, recommendations } = resolvedResult;

  const normalizedDisease = (disease || "").toLowerCase();
  const diseaseLabel = normalizedDisease.includes("fmd")
    ? t("result.diseaseFmd", "FMD")
    : normalizedDisease.includes("healthy")
      ? t("result.diseaseHealthy", "Healthy")
      : disease || t("common.unknown", "Unknown");
  const severityLabel = String(severity || "").toLowerCase().includes("critical")
    ? t("result.severityCritical", "Critical")
    : String(severity || "").toLowerCase().includes("high")
      ? t("result.severityHigh", "High")
      : String(severity || "").toLowerCase().includes("moderate")
        ? t("result.severityModerate", "Moderate")
        : String(severity || "").toLowerCase().includes("low")
          ? t("result.severityLow", "Low")
          : severity || t("common.na", "N/A");
  const diseaseStyles = normalizedDisease.includes("fmd")
    ? "bg-red-50 text-red-700 border-red-200"
    : normalizedDisease.includes("healthy")
      ? "bg-[#e9f3ff] text-[#003366] border-[#dbeafe]"
      : "bg-amber-50 text-amber-700 border-amber-200";

  const generatePdfReport = async () => {
    if (!reportRef.current) return;

    try {
      setDownloading(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let yPosition = 0;
      pdf.addImage(imageData, "PNG", 0, yPosition, pdfWidth, pdfHeight);

      while (yPosition + pdfHeight > pageHeight) {
        yPosition -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, yPosition, pdfWidth, pdfHeight);
      }

      pdf.save(`fmd-diagnosis-report-${Date.now()}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] px-4 py-6 sm:px-6 md:py-10">
      <a
        href="#result-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow"
      >
        {t("common.skipToContent", "Skip to content")}
      </a>
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-content-center rounded-lg bg-[#003366] text-white font-bold shadow-sm">
                CC
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#003366]">
                  {t("result.complete", "Analysis Complete")}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  {t("result.title", "Cattle Health Result")}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {t(
                    "result.govSubtitle",
                    "Official preview of your analysis output. Download to share or archive."
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/analyze")}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
              >
                {t("result.backAnalyze", "Back to Analyze")}
              </button>
              <button
                type="button"
                onClick={generatePdfReport}
                disabled={downloading}
                className="rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#002a4d] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#003366]/25"
              >
                {downloading
                  ? t("result.preparingPdf", "Preparing PDF...")
                  : t("result.downloadPdf", "Download PDF Report")}
              </button>
            </div>
          </div>
        </header>

        <div
          id="result-content"
          ref={reportRef}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
        >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900">{t("result.uploadedImage", "Uploaded image")}</h3>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {uploadedImage ? (
                <div className="relative">
                  <div className="aspect-[4/3] w-full sm:aspect-[16/10]">
                    <img
                      src={uploadedImage}
                      alt={t("result.uploadedCattleAlt", "Uploaded cattle")}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-red-500/20 via-yellow-400/10 to-transparent" />
                  <div className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
                    {t("result.overlayBadge", "Heatmap Overlay (Visual)")}
                  </div>
                </div>
              ) : (
                <div className="grid min-h-[220px] place-content-center text-sm text-slate-500 sm:min-h-[280px]">
                  {t("result.previewUnavailable", "Image preview unavailable")}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900">{t("result.prediction", "Prediction result")}</h3>
            <div className={`mt-4 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${diseaseStyles}`}>
              {t("result.diseaseDetected", "Disease detected")}: {diseaseLabel}
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{t("result.confidenceScore", "Confidence score")}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-800">
                  {typeof confidence === "number" ? `${(confidence * 100).toFixed(2)}%` : t("common.na", "N/A")}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{t("result.severity", "Severity")}</p>
                <p className="mt-1 text-base font-medium text-slate-700">{severityLabel}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t("result.dataSource", "Data source")}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {t("result.realData", "Live backend record")}
              </p>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h4 className="text-base font-semibold text-slate-900">{t("result.whyDetected", "Why this was detected")}</h4>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
              {(translatedDynamicText?.visual || explanation?.visual || []).map((v, i) => (
                <li key={`v-${i}`}>{v}</li>
              ))}
              {(translatedDynamicText?.texture || explanation?.texture || []).map((textureItem, i) => (
                <li key={`t-${i}`}>{textureItem}</li>
              ))}
              {(translatedDynamicText?.thermal || explanation?.thermal || []).map((th, i) => (
                <li key={`th-${i}`}>{th}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h4 className="text-base font-semibold text-slate-900">{t("result.recommendedActions", "Recommended actions")}</h4>
            <p className="mt-3 text-sm font-semibold text-slate-700">{t("result.precautions", "Precautions")}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {(translatedDynamicText?.precautions || recommendations?.precautions || []).map((p, i) => (
                <li key={`p-${i}`}>{p}</li>
              ))}
            </ul>

            <p className="mt-4 text-sm font-semibold text-slate-700">{t("result.treatment", "Treatment")}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {(translatedDynamicText?.treatment || recommendations?.treatment || []).map((treatmentItem, i) => (
                <li key={`tr-${i}`}>{treatmentItem}</li>
              ))}
            </ul>

            <p className="mt-4 text-sm text-slate-700">
              <span className="font-semibold">{t("result.vaccination", "Vaccination")}:</span>{" "}
              {translatedDynamicText?.vaccination || recommendations?.vaccination || t("common.na", "N/A")}
            </p>
          </section>
        </div>
        </div>
      </div>
      <PageFooter variant="user" />
    </div>
  );
}
