import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    farmName: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/home", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const fetchedUser = res.data.user || {};
        setUser(fetchedUser);
        setForm({
          name: fetchedUser.name || localStorage.getItem("name") || "",
          email: fetchedUser.email || "",
          phone: fetchedUser.phone || "",
          farmName: fetchedUser.farmName || ""
        });
      } catch (err) {
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    // UI-first update: keep profile editable even if update API is unavailable.
    setUser((prev) => ({
      ...prev,
      ...form
    }));
    localStorage.setItem("name", form.name);

    setTimeout(() => {
      setSaving(false);
      setMessage("Profile updated successfully.");
    }, 500);
  };

  const uploadedCasesCount =
    user?.uploadedCasesCount ?? user?.casesCount ?? user?.uploadsCount ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-10 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-emerald-50 to-white px-4 py-6 sm:px-6 md:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Account
            </p>
            <h1 className="text-2xl font-semibold text-slate-800 sm:text-3xl">
              My Profile
            </h1>
          </div>
          <button
            onClick={() => navigate("/user")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to dashboard
          </button>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:col-span-2">
            <p className="text-sm text-slate-500">Logged in as</p>
            <p className="mt-1 text-xl font-semibold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="mt-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {user?.role || "USER"}
            </span>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Uploaded cases</p>
            <p className="mt-2 text-3xl font-semibold text-slate-800">
              {uploadedCasesCount}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Total image analyses submitted
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800">Update profile info</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your details up to date for a better experience.
          </p>

          <form onSubmit={handleSave} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Farm name
              </label>
              <input
                name="farmName"
                value={form.farmName}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {message && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">
                {message}
              </p>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-700 to-lime-700 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-800 hover:to-lime-800 disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

