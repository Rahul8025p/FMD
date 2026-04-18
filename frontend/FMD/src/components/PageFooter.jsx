import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";

const linkClass =
  "text-sm text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-sm";

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
  let heading;
  let isCompactAuthFooter = false;
  switch (variant) {
    case "auth":
      nav = authNav;
      heading = t("footer.headingAuth", "Quick access for sign-in");
      blurb = t(
        "footer.blurbPublic",
        "Foot-and-mouth disease awareness and AI-assisted image screening for healthier herds."
      );
      isCompactAuthFooter = true;
      break;
    case "user":
      nav = userNav;
      heading = t("footer.headingUser", "Your farm workspace");
      blurb = t(
        "footer.blurbUser",
        "Your herd health workspace — analyze images, review history, and manage your account."
      );
      break;
    case "admin":
      nav = adminNav;
      heading = t("footer.headingAdmin", "Monitoring and operations");
      blurb = t(
        "footer.blurbAdmin",
        "Operational monitoring for FMD-related signals across uploaded cases."
      );
      break;
    case "adminAuth":
      nav = adminAuthNav;
      heading = t("footer.headingAdminAuth", "Restricted admin entry");
      blurb = t(
        "footer.blurbAdminAuth",
        "Authorized access only. Farmers and vets should use the public sign-in or registration pages."
      );
      break;
    default:
      nav = publicNav;
      heading = t("footer.headingPublic", "Explore CattleCare AI");
      blurb = t(
        "footer.blurbPublic",
        "Foot-and-mouth disease awareness and AI-assisted image screening for healthier herds."
      );
  }

  return (
    <footer
      role="contentinfo"
      className={`mt-auto border-t border-slate-200 bg-white ${className}`}
    >
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${isCompactAuthFooter ? "max-w-5xl py-6" : "max-w-7xl py-8"}`}>
        <div
          className={`flex flex-col ${
            isCompactAuthFooter
              ? "gap-5 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4 text-center sm:px-6"
              : "gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12"
          }`}
        >
          <div className={isCompactAuthFooter ? "mx-auto max-w-2xl" : "max-w-lg"}>
            <p className="text-sm font-semibold text-slate-900">CattleCare AI</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{heading}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">{blurb}</p>
          </div>
          <div className={isCompactAuthFooter ? "mx-auto" : "shrink-0"}>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
              {t("footer.navLabel", "Footer navigation")}
            </p>
            <nav
              className={`flex flex-wrap gap-y-2 ${
                isCompactAuthFooter
                  ? "justify-center gap-x-4 sm:gap-x-5"
                  : "max-w-xl gap-x-5 sm:gap-x-6"
              }`}
              aria-label={t("footer.navLabel", "Footer navigation")}
            >
              {nav}
            </nav>
          </div>
        </div>
        <div
          className={`flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:text-sm ${
            isCompactAuthFooter ? "mt-5" : "mt-8"
          }`}
        >
          <p>
            © {year} CattleCare AI. {t("footer.rights", "All rights reserved.")}
          </p>
          <p className="max-w-xl sm:text-right">
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
