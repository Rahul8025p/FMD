import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider";
import PageFooter from "../components/PageFooter";
import FloatingImageGallery from "../components/FloatingImageGallery";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [authRole, setAuthRole] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    return token ? role : null;
  });
  const isUser = authRole === "USER";
  const isAdmin = authRole === "ADMIN";
  const isAuthenticated = Boolean(authRole);

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      setAuthRole(token ? role : null);
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const goAnalyze = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "USER") {
      navigate("/analyze");
    } else if (token && role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setAuthRole(null);
    navigate("/");
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
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate(isAdmin ? "/admin" : "/user")}
                className="rounded-md px-4 py-2 text-sm font-medium text-[#003366] hover:underline"
              >
                {isAdmin ? t("landing.adminDashboard", "Admin Dashboard") : t("landing.userDashboard", "My Dashboard")}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                {t("common.logout", "Logout")}
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative mb-8 w-full overflow-hidden sm:mb-10 lg:mb-12">
        <FloatingImageGallery variant="hero" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(2,6,23,0.9)_0%,rgba(2,6,23,0.75)_44%,rgba(15,23,42,0.45)_70%,rgba(15,23,42,0.2)_100%)]" />
        <div className="relative mx-auto grid min-h-[72vh] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            {t("landing.heroTag", "FMD Detection & Classification System")}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t("landing.heroTitle", "Image-based disease detection for healthier herds")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-200 sm:text-lg">
            {t("landing.heroDesc", "Upload or capture livestock images and get fast AI-assisted indications of Foot-and-Mouth Disease.")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={goAnalyze}
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-900/20 transition hover:scale-[1.02] hover:bg-emerald-400"
            >
              {t("landing.analyzeImage", "Analyze Image")}
            </button>
            <button
              onClick={() => navigate("/disease-info")}
              className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:scale-[1.02] hover:bg-white/20"
            >
              {t("landing.learnFmd", "Learn about FMD")}
            </button>
            <button
              onClick={() => navigate(isUser ? "/user" : isAdmin ? "/admin" : "/register")}
              className="rounded-xl border border-emerald-200/60 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:scale-[1.02] hover:bg-emerald-100"
            >
              {t("landing.getStarted", isAuthenticated ? "Open Dashboard" : "Get Started")}
            </button>
          </div>
        </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:pb-14">
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

