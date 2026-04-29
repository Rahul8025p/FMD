import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { useI18n } from "../i18n/I18nProvider";
import PageFooter from "../components/PageFooter";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError(t("adminLogin.required", "Email and password are required."));
      return;
    }

    try {
      setLoading(true);
      await login({
        email: form.email.trim(),
        password: form.password
      });
      const role = localStorage.getItem("role");
      if (role !== "ADMIN") {
        localStorage.clear();
        setError(t("adminLogin.onlyAdmin", "This login is only for admin accounts."));
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.message || t("adminLogin.failed", "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-[#e6f2ff] to-white px-4 py-6 sm:px-6 md:py-10">
      <div className="flex w-full flex-1 flex-col justify-center sm:py-4">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:text-sm"
          >
            {t("common.back", "Back")}
          </button>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#003366]">
          {t("adminLogin.access", "Admin Access")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">
          {t("adminLogin.title", "Admin Sign in")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("adminLogin.subtitle", "Use your admin credentials to access monitoring tools.")}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t("adminLogin.emailPlaceholder", "admin@example.com")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t("common.password", "Password")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#003366] py-2.5 font-semibold text-white transition hover:bg-[#002a4d] disabled:opacity-60"
          >
            {loading ? t("login.signingIn", "Signing in...") : t("adminLogin.submit", "Sign in as Admin")}
          </button>
        </form>
      </div>
      </div>
      <PageFooter variant="adminAuth" />
    </div>
  );
}

