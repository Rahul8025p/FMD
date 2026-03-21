import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 px-4 py-6 sm:px-6 md:px-8 md:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl">
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur sm:p-6 md:p-8 lg:p-9">
          <div className="mb-6 md:mb-7">
            <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl md:text-3xl">
              Sign in
            </h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Access CattleCare AI diagnostic system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
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
              {loading ? "Signing in..." : "Sign in"}
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
      </div>
    </div>
  );
}
