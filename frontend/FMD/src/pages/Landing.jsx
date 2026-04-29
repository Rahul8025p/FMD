import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider";
import PageFooter from "../components/PageFooter";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useI18n();

  // If already authenticated, optionally take user straight to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "USER") return;
  }, []);

  const goAnalyze = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/analyze");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#eef6ff] via-white to-[#f8fafc]">
      <div className="flex-1">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:block"
          >
            {t("common.back", "Back")}
          </button>
          <div className="grid h-9 w-9 place-content-center rounded-md bg-[#003366] text-white font-bold">
            CC
          </div>
          <span className="text-lg font-semibold text-[#003366]">
            CattleCare AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/login")}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:underline"
          >
            {t("landing.admin", "Admin")}
          </button>
          <button
            onClick={() => navigate("/login")}
            className="rounded-md px-4 py-2 text-sm font-medium text-[#003366] hover:underline"
          >
            {t("landing.signIn", "Sign in")}
          </button>
          <button
            onClick={() => navigate("/register")}
            className="rounded-md bg-[#003366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#002a4d]"
          >
            {t("landing.signUp", "Sign up")}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#003366]">
            {t("landing.heroTag", "FMD Detection & Classification System")}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            {t("landing.heroTitle", "Image-based disease detection for healthier herds")}
          </h1>
          <p className="mt-3 text-slate-600">
            {t("landing.heroDesc", "Upload or capture livestock images and get fast AI-assisted indications of Foot-and-Mouth Disease.")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={goAnalyze}
              className="rounded-lg bg-[#003366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#002a4d]"
            >
              {t("landing.analyzeImage", "Analyze Image")}
            </button>
            <button
              onClick={() => navigate("/disease-info")}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("landing.learnFmd", "Learn about FMD")}
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-lg border border-[#dbeafe] bg-[#e9f3ff] px-5 py-3 text-sm font-semibold text-[#003366] hover:bg-[#dbeafe]"
            >
              {t("landing.getStarted", "Get Started")}
            </button>
          </div>
        </div>

        {/* Hero visual (placeholder artwork) */}
        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-2xl border border-slate-200 bg-gradient-to-br from-[#003366] via-[#0b4c7a] to-[#0f6aa8] shadow-lg" />
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 grid place-content-center">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/30">
              {t("landing.visualBadge", "Livestock AI Imaging")}
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">
              {t("landing.feature1Title", "Image-based detection")}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {t(
                "landing.feature1Desc",
                "Upload or capture images of mouth or hooves and let AI assist with preliminary detection."
              )}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">
              {t("landing.feature2Title", "Fast results")}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {t(
                "landing.feature2Desc",
                "Get quick indications and move faster on treatment or prevention."
              )}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900">
              {t("landing.feature3Title", "Disease classification")}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {t(
                "landing.feature3Desc",
                "Model-powered classification to assist decision making in the field."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Optional stats/impact */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {t("landing.statsImages", "Images analyzed")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">5k+</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {t("landing.statsTime", "Avg. time")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">~3s</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {t("landing.statsRegions", "Regions")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">20+</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {t("landing.statsDevices", "Devices")}
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {t("landing.statsDevicesValue", "Mobile/Web")}
            </p>
          </div>
        </div>
      </section>
      </div>
      <PageFooter variant="public" />
    </div>
  );
}

