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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm">

        <h1 className="text-2xl font-semibold text-slate-800 mb-1">
          Sign in
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Access CattleCare AI diagnostic system
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
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
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-none pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 text-white py-2.5 rounded-md font-medium hover:bg-emerald-800 transition disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 border-t pt-4 text-xs text-slate-400">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-emerald-700 cursor-pointer hover:underline"
          >
            Create account
          </span>
        </div>
      </div>
    </div>
  );
}
