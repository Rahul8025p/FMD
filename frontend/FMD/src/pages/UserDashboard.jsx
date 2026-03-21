import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:5000/api/user/home",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(res.data.user);

      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("role", res.data.user.role);
    } catch (err) {
      localStorage.clear();
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-emerald-700">
          CattleCare AI
        </h1>

        {/* User Profile */}
        <div className="relative group">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold cursor-pointer">
            {user?.name?.charAt(0).toUpperCase()}

          </div>

          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto">
            <div className="px-4 py-3 text-sm text-slate-700">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          Welcome, {user?.name} 🌾
        </h2>

        <p className="text-slate-500 mb-8">
          Monitor cattle health and detect diseases early using AI-powered image analysis.
        </p>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-2">📷 Image-Based Diagnosis</h3>
            <p className="text-sm text-slate-500">
              Upload or capture cattle images to detect diseases using deep learning.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-2">🧠 AI-Powered Insights</h3>
            <p className="text-sm text-slate-500">
              MobileNet Model analysis of hooves and mouth lesions for early detection.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-2">🛡️ Preventive Guidance</h3>
            <p className="text-sm text-slate-500">
              Treatment and vaccination recommendations after diagnosis.
            </p>
          </div>
        </div>

        {/* Primary Action */}
        <div className="bg-emerald-700 rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Analyze Cattle Health
            </h3>
            <p className="text-emerald-100 text-sm">
              Upload images and let AI assist you in disease detection.
            </p>
          </div>

          <button
            onClick={() => navigate("/analyze")}
            className="mt-4 md:mt-0 bg-white text-emerald-700 px-6 py-3 rounded-md font-medium hover:bg-slate-100 transition"
          >
            Start Analysis →
          </button>
        </div>

      </div>
    </div>
  );
}
