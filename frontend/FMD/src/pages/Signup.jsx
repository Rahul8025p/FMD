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

  const handleAltSignup = (provider) => {
    setError(`${provider} sign-up will be available soon.`);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-lime-50 to-emerald-100 px-4 py-6 sm:px-6 md:py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl lg:grid-cols-2">
        <section className="px-5 py-6 sm:px-8 sm:py-8 md:px-10 lg:px-12 lg:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Create account</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Start managing herd health smarter</h1>
          <p className="mt-1 text-sm text-slate-500">Quick setup for farmers, vets, and farm teams.</p>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleAltSignup("Google")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign up with Google
            </button>
            <button
              type="button"
              onClick={() => handleAltSignup("Phone OTP")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign up with OTP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
              <input
                name="name"
                value={form.name}
                placeholder="Enter your name"
                autoComplete="name"
                required
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="farmer@example.com"
                autoComplete="email"
                required
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Create password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-16 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-16 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Use 8+ characters with uppercase, lowercase, number, and symbol.
            </p>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
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
              className="w-full rounded-xl bg-gradient-to-r from-emerald-700 to-lime-700 py-3 text-base font-semibold text-white shadow-md transition hover:from-emerald-800 hover:to-lime-800 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-emerald-700 hover:underline"
            >
              Sign in
            </button>
          </div>
        </section>

        <aside className="relative hidden bg-gradient-to-br from-lime-700 via-emerald-700 to-emerald-900 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_60%)]" />
          <div className="relative">
            <p className="inline-block rounded-full border border-white/30 px-3 py-1 text-xs uppercase tracking-wider">
              FMD Care
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight">
              One platform for
              <br />
              healthier farms.
            </h2>
            <p className="mt-3 text-sm text-emerald-50/95">
              Get alerts, record cases, and manage prevention workflows with a clean, field-ready interface.
            </p>
          </div>
          <div className="relative grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Farmer first</div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Easy onboarding</div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Actionable insights</div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">Mobile ready</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
