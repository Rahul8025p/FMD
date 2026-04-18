import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { runSilentGeoLanguageDetection } from "../services/language";
import { useI18n } from "../i18n/I18nProvider";
import PageFooter from "../components/PageFooter";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const { t, setLanguage } = useI18n();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setError("");
  };

  const validateForm = () => {
    if (!form.email.trim()) return t("login.emailRequired", "Email is required.");
    if (!emailRegex.test(form.email)) return t("login.emailInvalid", "Enter a valid email address.");
    if (!form.password) return t("login.passwordRequired", "Password is required.");
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await login({
        email: form.email.trim(),
        password: form.password
      });

      const role = localStorage.getItem("role");
      if (role === "USER") {
        runSilentGeoLanguageDetection((detectedLang) => {
          setLanguage(detectedLang);
        });
      }
      navigate(role === "ADMIN" ? "/admin" : "/user");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          t("login.invalidCredentials", "Invalid email or password.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAltSignIn = (provider) => {
    setError(t("login.altSignInSoon", `${provider} sign-in will be available soon.`));
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-lime-100 via-emerald-50 to-stone-100 px-4 py-6 sm:px-6 md:py-10">
      <div className="mx-auto grid w-full max-w-6xl flex-1 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl lg:grid-cols-2">
        <aside className="relative hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-lime-700 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.32),transparent_55%)]" />
          <div className="relative">
            <p className="inline-block rounded-full border border-white/30 px-3 py-1 text-xs uppercase tracking-wider text-emerald-50">
              {t("login.badge", "FMD Care")}
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight">
              {t("login.heroLine1", "Healthy herd,")}
              <br />
              {t("login.heroLine2", "smarter farming.")}
            </h2>
            <p className="mt-3 text-sm text-emerald-50/90">
              {t(
                "login.heroDesc",
                "Monitor livestock health, view disease analysis, and make confident decisions faster."
              )}
            </p>
          </div>
          <div className="relative grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">{t("login.tag1", "Fast diagnosis")}</div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">{t("login.tag2", "Farm-friendly UI")}</div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">{t("login.tag3", "Any device")}</div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">{t("login.tag4", "Secure records")}</div>
          </div>
        </aside>

        <section className="px-5 py-6 sm:px-8 sm:py-8 md:px-10 lg:px-12 lg:py-10">
          <div className="mb-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:text-sm"
            >
              {t("common.back", "Back")}
            </button>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{t("login.welcomeBack", "Welcome back")}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">{t("auth.signInTitle", "Sign in to your farm dashboard")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("login.signInHelp", "Use email/password or quick sign-in options below.")}</p>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => handleAltSignIn("Google")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t("login.continueGoogle", "Continue with Google")}
            </button>
            <button
              type="button"
              onClick={() => handleAltSignIn("Phone OTP")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t("login.continueOtp", "Continue with OTP")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              {t("login.createAccount", "Create new account")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("common.email", "Email")}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder={t("login.emailPlaceholder", "farmer@example.com")}
                autoComplete="email"
                required
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("common.password", "Password")}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  placeholder={t("login.passwordPlaceholder", "Enter your password")}
                  autoComplete="current-password"
                  required
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-16 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                  aria-label={showPassword ? t("login.hidePassword", "Hide password") : t("login.showPassword", "Show password")}
                >
                  {showPassword ? t("login.hide", "Hide") : t("login.show", "Show")}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                {t("login.keepSignedIn", "Keep me signed in")}
              </label>
              <button
                type="button"
                onClick={() => handleAltSignIn("Password reset")}
                className="font-medium text-emerald-700 hover:underline"
              >
                {t("login.forgotPassword", "Forgot password?")}
              </button>
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-700 to-lime-700 py-3 text-base font-semibold text-white shadow-md transition hover:from-emerald-800 hover:to-lime-800 disabled:opacity-60"
            >
              {loading ? t("login.signingIn", "Signing in...") : t("landing.signIn", "Sign in")}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
            {t("login.newToApp", "New to CattleCare?")}{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-emerald-700 hover:underline"
            >
              {t("login.signUpHere", "Sign up here")}
            </button>
            <p className="mt-2 text-xs text-slate-400">
              {t("login.adminAccess", "Admin access?")}{" "}
              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                className="font-medium text-emerald-700 hover:underline"
              >
                {t("login.useAdminLogin", "Use admin login")}
              </button>
            </p>
          </div>
        </section>
      </div>
      <PageFooter variant="auth" />
    </div>
  );
}
