import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";

const linkClass =
  "rounded text-sm font-medium text-slate-600 transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";

export default function PageFooter({ variant = "public", className = "" }) {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const publicNav = (
    <>
      <Link to="/" className={linkClass}>
        {t("footer.home", "Home")}
      </Link>
      <Link to="/disease-info" className={linkClass}>
        {t("footer.diseaseInfo", "Disease info")}
      </Link>
      <Link to="/login" className={linkClass}>
        {t("footer.signIn", "Sign in")}
      </Link>
      <Link to="/register" className={linkClass}>
        {t("footer.signUp", "Sign up")}
      </Link>
    </>
  );

  const authNav = (
    <>
      {publicNav}
      <Link to="/admin/login" className={linkClass}>
        {t("footer.adminLogin", "Admin login")}
      </Link>
    </>
  );

  const userNav = (
    <>
      <Link to="/user" className={linkClass}>
        {t("footer.dashboard", "Dashboard")}
      </Link>
      <Link to="/analyze" className={linkClass}>
        {t("footer.analyze", "Analyze")}
      </Link>
      <Link to="/history" className={linkClass}>
        {t("footer.history", "History")}
      </Link>
      <Link to="/profile" className={linkClass}>
        {t("footer.profile", "Profile")}
      </Link>
      <Link to="/disease-info" className={linkClass}>
        {t("footer.diseaseInfo", "Disease info")}
      </Link>
    </>
  );

  const adminNav = (
    <>
      <Link to="/admin" className={linkClass}>
        {t("footer.adminDashboard", "Admin dashboard")}
      </Link>
      <Link to="/admin/heatmap" className={linkClass}>
        {t("footer.caseMap", "Case map")}
      </Link>
      <Link to="/" className={linkClass}>
        {t("footer.publicSite", "Public site")}
      </Link>
      <Link to="/disease-info" className={linkClass}>
        {t("footer.diseaseInfo", "Disease info")}
      </Link>
    </>
  );

  const adminAuthNav = (
    <>
      <Link to="/" className={linkClass}>
        {t("footer.home", "Home")}
      </Link>
      <Link to="/login" className={linkClass}>
        {t("footer.userSignIn", "User sign in")}
      </Link>
      <Link to="/register" className={linkClass}>
        {t("footer.signUp", "Sign up")}
      </Link>
      <Link to="/disease-info" className={linkClass}>
        {t("footer.diseaseInfo", "Disease info")}
      </Link>
    </>
  );

  let nav;
  let blurb;
  switch (variant) {
    case "auth":
      nav = authNav;
      blurb = t(
        "footer.blurbPublic",
        "Foot-and-mouth disease awareness and AI-assisted image screening for healthier herds."
      );
      break;
    case "user":
      nav = userNav;
      blurb = t(
        "footer.blurbUser",
        "Your herd health workspace — analyze images, review history, and manage your account."
      );
      break;
    case "admin":
      nav = adminNav;
      blurb = t(
        "footer.blurbAdmin",
        "Operational monitoring for FMD-related signals across uploaded cases."
      );
      break;
    case "adminAuth":
      nav = adminAuthNav;
      blurb = t(
        "footer.blurbAdminAuth",
        "Authorized access only. Farmers and vets should use the public sign-in or registration pages."
      );
      break;
    default:
      nav = publicNav;
      blurb = t(
        "footer.blurbPublic",
        "Foot-and-mouth disease awareness and AI-assisted image screening for healthier herds."
      );
  }

  return (
    <footer
      role="contentinfo"
      className={`mt-auto border-t border-emerald-100/90 bg-white/95 shadow-[0_-1px_0_rgba(15,23,42,0.04)] backdrop-blur-md ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <p className="text-sm font-semibold text-emerald-800">CattleCare AI</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{blurb}</p>
          </div>
          <nav
            className="flex flex-wrap gap-x-4 gap-y-3 sm:gap-x-6 md:gap-x-8"
            aria-label={t("footer.navLabel", "Footer navigation")}
          >
            {nav}
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:text-sm">
          <p className="shrink-0">
            © {year} CattleCare AI. {t("footer.rights", "All rights reserved.")}
          </p>
          <p className="max-w-xl text-center sm:text-right">
            {t(
              "footer.disclaimer",
              "For decision support only — not a substitute for veterinary diagnosis."
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
