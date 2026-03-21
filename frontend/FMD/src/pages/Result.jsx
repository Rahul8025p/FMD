import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!state?.result) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-slate-600">No analysis result found.</p>
          <button
            className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white transition hover:bg-emerald-800"
            onClick={() => navigate("/analyze")}
          >
            Go to Analyze
          </button>
        </div>
      </div>
    );
  }

  const { disease, confidence, severity, explanation, recommendations } =
    state.result;
  const uploadedImage = state.uploadedImage;

  const normalizedDisease = (disease || "").toLowerCase();
  const diseaseStyles = normalizedDisease.includes("fmd")
    ? "bg-red-50 text-red-700 border-red-200"
    : normalizedDisease.includes("healthy")
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
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
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-emerald-50 to-white px-4 py-6 sm:px-6 md:py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Analysis Complete
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-800">
                Cattle Health Result
              </h2>
            </div>
            <button
              onClick={() => navigate("/analyze")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Analyze another image
            </button>
            <button
              onClick={generatePdfReport}
              disabled={downloading}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
            >
              {downloading ? "Preparing PDF..." : "Download PDF Report"}
            </button>
          </div>
        </div>

        <div ref={reportRef} className="space-y-6 rounded-2xl border border-slate-200 bg-white/40 p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-slate-800">Uploaded image</h3>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {uploadedImage ? (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded cattle"
                    className="h-64 w-full object-cover sm:h-72"
                    crossOrigin="anonymous"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-red-500/20 via-yellow-400/10 to-transparent" />
                  <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
                    Heatmap Overlay (Visual)
                  </div>
                </div>
              ) : (
                <div className="grid h-64 place-content-center text-sm text-slate-500 sm:h-72">
                  Image preview unavailable
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-semibold text-slate-800">Prediction result</h3>
            <div className={`mt-4 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${diseaseStyles}`}>
              Disease detected: {disease || "Unknown"}
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Confidence score</p>
                <p className="mt-1 text-2xl font-semibold text-slate-800">
                  {typeof confidence === "number" ? `${(confidence * 100).toFixed(2)}%` : "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Severity</p>
                <p className="mt-1 text-base font-medium text-slate-700">{severity || "N/A"}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
            <h4 className="text-base font-semibold text-slate-800">Why this was detected</h4>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              {explanation?.visual?.map((v, i) => (
                <li key={`v-${i}`}>{v}</li>
              ))}
              {explanation?.texture?.map((t, i) => (
                <li key={`t-${i}`}>{t}</li>
              ))}
              {explanation?.thermal?.map((th, i) => (
                <li key={`th-${i}`}>{th}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
            <h4 className="text-base font-semibold text-slate-800">Recommended actions</h4>
            <p className="mt-3 text-sm font-semibold text-slate-700">Precautions</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {recommendations?.precautions?.map((p, i) => (
                <li key={`p-${i}`}>{p}</li>
              ))}
            </ul>

            <p className="mt-4 text-sm font-semibold text-slate-700">Treatment</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {recommendations?.treatment?.map((t, i) => (
                <li key={`tr-${i}`}>{t}</li>
              ))}
            </ul>

            <p className="mt-4 text-sm text-slate-700">
              <span className="font-semibold">Vaccination:</span>{" "}
              {recommendations?.vaccination || "N/A"}
            </p>
          </section>
        </div>
        </div>
      </div>
    </div>
  );
}
