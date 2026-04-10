import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useI18n } from "../i18n/I18nProvider";

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
      setError("Email and password are required.");
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
        setError("This login is only for admin accounts.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-white px-4 py-6 sm:px-6 md:py-10">
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
        <div className="mb-3">
          <LanguageSwitcher compact />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Admin Access
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-800">
          Admin Sign in
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Use your admin credentials to access monitoring tools.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@example.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-700 py-2.5 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

