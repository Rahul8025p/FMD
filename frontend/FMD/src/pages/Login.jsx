import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    organization: "",
    phone: "",
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
    if (!form.email.trim()) return "Email is required.";
    if (!emailRegex.test(form.email)) return "Enter a valid email address.";
    if (!form.password) return "Password is required.";
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
      navigate(role === "ADMIN" ? "/admin" : "/user");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAltSignIn = (provider) => {
    setError(`${provider} sign-in will be available soon.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-white px-4 py-6 sm:px-6 md:px-8 md:py-10 lg:py-14">
      <div className="mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-2">
        <section className="hidden rounded-3xl bg-emerald-800 p-8 text-white shadow-lg lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div>
            <p className="inline-flex rounded-full border border-white/25 px-3 py-1 text-xs uppercase tracking-wider text-emerald-100">
              CattleCare AI
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight">
              Smart livestock diagnostics with faster, guided decisions.
            </h2>
            <p className="mt-4 text-emerald-100">
              Access reports, herd insights, and treatment recommendations from one secure dashboard.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">24/7 monitoring</div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">Secure records</div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">Role-based access</div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">Mobile ready</div>
          </div>
        </section>

        <section className="w-full">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur sm:p-6 md:p-8 lg:p-9">
            <div className="mb-6 md:mb-7">
              <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl md:text-3xl">
              Sign in
              </h1>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Welcome back. Continue to your CattleCare dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => handleAltSignIn("Google")}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleAltSignIn("Microsoft")}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                Microsoft
              </button>
              <button
                type="button"
                onClick={() => handleAltSignIn("OTP")}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                Phone OTP
              </button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs uppercase tracking-wide text-slate-400">or continue with email</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:text-base md:py-3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Organization <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="organization"
                    placeholder="Farm / Clinic name"
                    onChange={handleChange}
                    value={form.organization}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:text-base md:py-3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Phone <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    onChange={handleChange}
                    value={form.phone}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:text-base md:py-3"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-14 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:text-base md:py-3"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:text-sm"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="inline-flex cursor-pointer items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => handleAltSignIn("Password reset")}
                  className="font-medium text-emerald-700 transition hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  Forgot password?
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
                className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base md:py-3"
              >
                {loading ? "Signing in..." : "Sign in securely"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500 sm:text-sm">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-emerald-700 transition hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                Create account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
