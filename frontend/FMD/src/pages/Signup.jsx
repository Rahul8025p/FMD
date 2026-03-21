import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Name is required.";
    }

    if (!form.email.trim()) {
      return "Email is required.";
    }

    if (!passwordRegex.test(form.password)) {
      return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    if (!agreeTerms) {
      return "Please agree to Terms & Conditions.";
    }

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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });
      navigate("/user");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-center text-3xl font-bold text-slate-800">Create Your Account</h1>
            <p className="mt-1 text-center text-slate-500">Join us to detect and manage FMD</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3 sm:space-y-4">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
                <input
                  name="name"
                  value={form.name}
                  placeholder="Full Name"
                  autoComplete="name"
                  required
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

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
                  placeholder="Create Password"
                  autoComplete="new-password"
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

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  required
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-16 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Must be 8+ chars, include uppercase, lowercase, number & symbol
              </p>

              <label className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    setError("");
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                I agree to the <span className="font-semibold text-emerald-700">Terms & Conditions</span>
              </label>

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
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="font-semibold text-emerald-700 hover:underline"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
