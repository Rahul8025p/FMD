import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 md:py-10">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="relative bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-600 px-4 py-8 text-center sm:px-6 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)]" />
            <h2 className="relative text-xl font-bold text-white sm:text-2xl">
              FMD Detection & Classification System
            </h2>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8 md:px-10">
            <h1 className="text-center text-3xl font-bold text-slate-800">Welcome Back!</h1>
            <p className="mt-1 text-center text-slate-500">Please login to continue</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-5">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">✉</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  placeholder="Email Address"
                  autoComplete="email"
                  required
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-16 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
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
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={() => handleAltSignIn("Password reset")}
                  className="text-slate-600 hover:text-emerald-700 hover:underline"
                >
                  Forgot Password?
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
                className="w-full rounded-lg bg-gradient-to-r from-emerald-700 to-emerald-600 py-2.5 text-lg font-semibold text-white shadow-md transition hover:from-emerald-800 hover:to-emerald-700 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>Or login with</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-4 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => handleAltSignIn("Google")}
                className="h-11 w-11 rounded-full border border-slate-300 bg-white text-lg shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                aria-label="Continue with Google"
              >
                G
              </button>
              <button
                type="button"
                onClick={() => handleAltSignIn("Facebook")}
                className="h-11 w-11 rounded-full border border-slate-300 bg-blue-600 text-lg font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                aria-label="Continue with Facebook"
              >
                f
              </button>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
              New to the platform?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-semibold text-emerald-700 hover:underline"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
