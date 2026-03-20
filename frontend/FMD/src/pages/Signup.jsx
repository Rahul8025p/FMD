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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm">

        <h1 className="text-2xl font-semibold text-slate-800 mb-1">
          Create account
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Register for CattleCare AI access
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            placeholder="Full name"
            autoComplete="name"
            required
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email address"
            autoComplete="email"
            required
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
            required
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />

          <p className="text-xs text-slate-500">
            Must be 8+ chars, include uppercase, lowercase, number & symbol
          </p>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            autoComplete="new-password"
            required
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />

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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="mt-6 border-t pt-4 text-xs text-slate-400">
          Already registered?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-emerald-700 cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
}
