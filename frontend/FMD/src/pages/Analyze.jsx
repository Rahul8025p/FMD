import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Analyze() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("upload"); // 'upload' | 'camera'
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("name") || "U");

  const [form, setForm] = useState({
    rfid: "",
    breed: "",
    age: "",
    sex: "Female",
    fever: "No",
    temperature: "",
    latitude: "",
    longitude: "",
  });

  /* 🔐 Protect route + GPS */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    setUserName(localStorage.getItem("name") || "User");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
        ...prev,
        latitude: pos.coords.latitude.toFixed(4),
        longitude: pos.coords.longitude.toFixed(4),
      }));
      },
      () => alert("Please allow location access for accurate tracking")
    );

    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [navigate, preview]);

  /* 🧠 Input handler */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  /* 📁 File upload */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  /* 📸 Camera */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraOn(true);
      setMode("camera");
    } catch {
      alert("Camera permission denied");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
    setMode("upload");
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "cattle.jpg", { type: "image/jpeg" });
      setImage(file);
      setPreview(URL.createObjectURL(file));
      stopCamera();
    });
  };

  /* 🚀 Submit */
  const analyzeImage = async () => {
    if (!image || !form.rfid) {
      setError("RFID number and cattle image are required.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", image);

      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value)
      );

      const res = await api.post("/user/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/result", { state: { ...res.data, uploadedImage: preview } });
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-emerald-50 to-white">
      {/* Header like dashboard */}
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-content-center rounded-md bg-emerald-600 font-bold text-white">
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
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {userName.charAt(0).toUpperCase()}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="px-4 py-3 text-sm text-slate-700">
                  <p className="font-medium">{userName}</p>
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

      <div className="px-4 py-6 sm:px-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-700 to-lime-700 px-5 py-7 text-white sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-widest text-emerald-100">
              CattleCare AI
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Cattle Health Analysis</h2>
            <p className="text-sm text-emerald-100">
              Upload or capture an image to detect diseases using AI
            </p>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8 space-y-6">
          {/* Segmented media controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setMode("upload")}
                className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                  mode === "upload" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                From device
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("camera");
                  if (!cameraOn) startCamera();
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                  mode === "camera" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Use camera
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/user")}
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              Back to dashboard
            </button>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              name="rfid"
              placeholder="RFID Number (e.g. RFID-10234)"
              onChange={handleChange}
              className="input"
            />
            <input
              name="breed"
              placeholder="Breed (e.g. Jersey, Holstein)"
              onChange={handleChange}
              className="input"
            />
            <input
              name="age"
              type="number"
              placeholder="Age in years (e.g. 3)"
              onChange={handleChange}
              className="input"
            />
            <select name="sex" onChange={handleChange} className="input">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
            <select name="fever" onChange={handleChange} className="input">
              <option value="No">Fever: No</option>
              <option value="Yes">Fever: Yes</option>
            </select>
            {form.fever === "Yes" && (
              <input
                name="temperature"
                placeholder="Body temperature (°C) e.g. 39.5"
                onChange={handleChange}
                className="input"
              />
            )}
          </div>

          {/* Location (Auto) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500">Latitude</label>
              <input
                value={form.latitude}
                readOnly
                placeholder="Detecting latitude…"
                className="input bg-slate-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Longitude</label>
              <input
                value={form.longitude}
                readOnly
                placeholder="Detecting longitude…"
                className="input bg-slate-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Media section */}
          {mode === "upload" && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Upload cattle image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="mt-1"
              />
            </div>
          )}

          {mode === "camera" && (
            <div className="space-y-3">
              {!cameraOn && (
                <button onClick={startCamera} className="btn-secondary w-full">
                  📸 Start Camera
                </button>
              )}
              {cameraOn && (
                <>
                  <video ref={videoRef} autoPlay className="rounded-xl border w-full" />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={capturePhoto} className="btn-primary w-full">
                      Capture Photo
                    </button>
                    <button onClick={stopCamera} className="btn-secondary w-full">
                      Stop Camera
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="h-64 w-full rounded-xl border object-cover"
            />
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={analyzeImage}
            disabled={loading}
            className={`btn-primary w-full ${loading && "opacity-60"}`}
          >
            {loading ? "Analyzing cattle…" : "Analyze Cattle Health"}
          </button>

          <p className="text-center text-xs text-slate-400">
            Clear, well-lit images of mouth/hoof areas improve prediction accuracy.
          </p>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
      </div>
    </div>
  );
}
