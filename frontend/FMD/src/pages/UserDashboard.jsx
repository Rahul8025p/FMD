import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionError, setSessionError] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/user/home", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(res.data.user);

        localStorage.setItem("name", res.data.user.name);
        localStorage.setItem("role", res.data.user.role);
      } catch (err) {
        setSessionError("Your session has expired. Please sign in again.");
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-8 w-36 animate-pulse rounded-md bg-slate-200" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
          </div>
          <div className="mt-6 h-40 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-emerald-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-emerald-600 text-white grid place-content-center font-bold">
              CC
            </div>
            <span className="text-lg font-semibold text-emerald-800">
              CattleCare AI
            </span>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
              >
                <div className="px-4 py-3 text-sm text-slate-700">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800">
            Welcome, {user?.name} 🌾
          </h2>
          <p className="mt-1 text-slate-600">
            Monitor cattle health and detect diseases early using AI-powered image
            analysis.
          </p>
        </div>

        {/* Stats / Highlights */}
        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Scans this week</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">12</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Healthy scans</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">9</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Cases flagged</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">3</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Vaccinations due</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">5</p>
          </div>
        </section>

        {/* Quick actions + Learn */}
        <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-700 to-lime-700 p-7 text-white lg:col-span-2">
            <h3 className="text-xl font-semibold">Analyze Cattle Health</h3>
            <p className="mt-1 text-emerald-100">
              Upload images and let AI assist you in disease detection.
            </p>
            <button
              onClick={() => navigate("/analyze")}
              className="mt-5 rounded-lg bg-white px-6 py-3 font-medium text-emerald-700 transition hover:bg-slate-100"
            >
              Start Analysis →
            </button>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h4 className="font-semibold text-slate-800">Quick actions</h4>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <button
                onClick={() => navigate("/analyze")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                New scan
              </button>
              <button
                onClick={() => navigate("/result")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                View results
              </button>
              <button
                onClick={() => navigate("/user")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                My herd
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Profile
              </button>
              <button
                onClick={() => navigate("/history")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                History
              </button>
              <button
                onClick={() => navigate("/disease-info")}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
              >
                Help
              </button>
            </div>
          </div>
        </section>

        {/* Info cards */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold">📷 Image-Based Diagnosis</h3>
            <p className="text-sm text-slate-600">
              Upload or capture cattle images to detect diseases using deep learning.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold">🧠 AI-Powered Insights</h3>
            <p className="text-sm text-slate-600">
              MobileNet Model analysis of hooves and mouth lesions for early detection.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold">🛡️ Preventive Guidance</h3>
            <p className="text-sm text-slate-600">
              Treatment and vaccination recommendations after diagnosis.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
