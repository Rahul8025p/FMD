import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

  const galleryItems = [
    {
      title: t("landing.gallery1Title", "Official Screening"),
      desc: t("landing.gallery1Desc", "Submit an image for AI-assisted disease indication."),
      // Using gradient-only placeholders so it works without external image files.
      gradient: "from-[#003366] via-[#0b4c7a] to-[#0f6aa8]"
    },
    {
      title: t("landing.gallery2Title", "Farm-ready Reports"),
      desc: t("landing.gallery2Desc", "Get a structured result you can download and share."),
      gradient: "from-[#0f6aa8] via-[#2d9cdb] to-[#7dd3fc]"
    },
    {
      title: t("landing.gallery3Title", "Precaution Guidance"),
      desc: t("landing.gallery3Desc", "Understand recommended precautions after analysis."),
      gradient: "from-[#0b4c7a] via-[#003366] to-[#1f7a8c]"
    },
    {
      title: t("landing.gallery4Title", "History & Tracking"),
      desc: t("landing.gallery4Desc", "Review past cases and monitor trends over time."),
      gradient: "from-[#003366] via-[#0f6aa8] to-[#0b4c7a]"
    }
  ];

  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);

  useEffect(() => {
    if (galleryPaused) return;

    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mql?.matches) return;

    const id = window.setInterval(() => {
      setActiveGalleryIdx((i) => (i + 1) % galleryItems.length);
    }, 4200);

    return () => window.clearInterval(id);
  }, [galleryPaused, galleryItems.length]);

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

        {/* Hero visual floater (auto-rotating multi-image panels) */}
        <div
          className="relative"
          onMouseEnter={() => setGalleryPaused(true)}
          onMouseLeave={() => setGalleryPaused(false)}
          onFocus={() => setGalleryPaused(true)}
          onBlur={() => setGalleryPaused(false)}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)]" />

            {galleryItems.map((item, idx) => {
              const isActive = idx === activeGalleryIdx;
              return (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={`float-slide-${idx}`}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    isActive
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-4 scale-[0.98] pointer-events-none"
                  }`}
                  aria-hidden={!isActive}
                >
                  <div className={`h-full w-full bg-gradient-to-br ${item.gradient}`} />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent_45%)]" />

                  <div className="absolute left-4 right-4 bottom-4 rounded-xl border border-white/25 bg-white/90 backdrop-blur px-3 py-2 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#003366]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute left-4 top-4">
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/30">
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

