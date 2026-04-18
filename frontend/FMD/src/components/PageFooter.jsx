import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";

const linkClass =
  "rounded-md border border-transparent px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-emerald-100 hover:bg-emerald-50/70 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";

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
  let accentClass;
  let badge;
  switch (variant) {
    case "auth":
      nav = authNav;
      heading = t("footer.headingAuth", "Quick access for sign-in");
      blurb = t(
        "footer.blurbPublic",
        "Foot-and-mouth disease awareness and AI-assisted image screening for healthier herds."
      );
      accentClass = "from-emerald-500/15 via-lime-400/10 to-white";
      badge = t("footer.badgeAuth", "Account Access");
      break;
    case "user":
      nav = userNav;
      heading = t("footer.headingUser", "Your farm workspace");
      blurb = t(
        "footer.blurbUser",
        "Your herd health workspace — analyze images, review history, and manage your account."
      );
      accentClass = "from-emerald-600/15 via-teal-400/10 to-white";
      badge = t("footer.badgeUser", "User Console");
      break;
    case "admin":
      nav = adminNav;
      heading = t("footer.headingAdmin", "Monitoring and operations");
      blurb = t(
        "footer.blurbAdmin",
        "Operational monitoring for FMD-related signals across uploaded cases."
      );
      accentClass = "from-slate-700/15 via-emerald-500/10 to-white";
      badge = t("footer.badgeAdmin", "Admin Console");
      break;
    case "adminAuth":
      nav = adminAuthNav;
      heading = t("footer.headingAdminAuth", "Restricted admin entry");
      blurb = t(
        "footer.blurbAdminAuth",
        "Authorized access only. Farmers and vets should use the public sign-in or registration pages."
      );
      accentClass = "from-slate-600/15 via-amber-300/10 to-white";
      badge = t("footer.badgeAdminAuth", "Secure Access");
      break;
    default:
      nav = publicNav;
      heading = t("footer.headingPublic", "Explore CattleCare AI");
      blurb = t(
        "footer.blurbPublic",
        "Foot-and-mouth disease awareness and AI-assisted image screening for healthier herds."
      );
      accentClass = "from-emerald-500/15 via-lime-400/10 to-white";
      badge = t("footer.badgePublic", "Public Portal");
  }

  return (
    <footer
      role="contentinfo"
      className={`mt-auto border-t border-emerald-100/90 bg-white/95 backdrop-blur-md ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className={`rounded-2xl border border-emerald-100/80 bg-gradient-to-br ${accentClass} p-4 shadow-sm sm:p-6`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="inline-flex rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                {badge}
              </p>
              <p className="mt-3 text-base font-semibold text-slate-800 sm:text-lg">{heading}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{blurb}</p>
            </div>
            <div className="lg:max-w-[28rem]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("footer.navLabel", "Footer navigation")}
              </p>
              <nav
                className="flex flex-wrap gap-2"
                aria-label={t("footer.navLabel", "Footer navigation")}
              >
                {nav}
              </nav>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/70 pt-4 text-xs text-slate-500 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:text-sm">
            <p className="shrink-0">
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
      </div>
    </footer>
  );
}
