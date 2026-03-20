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
    if (!token) navigate("/");

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
  };

  /* 📁 File upload */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* 📸 Camera */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      alert("Camera permission denied");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
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
      alert("RFID number and cattle image are required");
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

      navigate("/result", { state: res.data });
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl border shadow-sm p-8 space-y-6">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-800">
            Cattle Health Analysis
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload or capture an image to detect diseases using AI
          </p>
        </div>

        {/* 🧾 Metadata */}
        <div className="grid grid-cols-2 gap-4">
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
              className="input col-span-2"
            />
          )}

          {/* 📍 Location (Auto-detected) */}
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

        </div>

        {/* 📁 Upload */}
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

        {!cameraOn && (
          <button onClick={startCamera} className="btn-secondary w-full">
            📸 Capture using Camera
          </button>
        )}

        {/* 🎥 Camera */}
        {cameraOn && (
          <div className="space-y-2">
            <video ref={videoRef} autoPlay className="rounded-xl border" />
            <button onClick={capturePhoto} className="btn-primary w-full">
              Capture Photo
            </button>
          </div>
        )}

        {/* 🖼 Preview */}
        {preview && !cameraOn && (
          <img
            src={preview}
            alt="Preview"
            className="rounded-xl border h-60 w-full object-cover"
          />
        )}

        {/* 🚀 Submit */}
        <button
          onClick={analyzeImage}
          disabled={loading}
          className={`btn-primary w-full ${loading && "opacity-60"}`}
        >
          {loading ? "Analyzing cattle…" : "Analyze Cattle Health"}
        </button>

        <p className="text-xs text-center text-slate-400">
          Clear images and accurate details improve prediction accuracy
        </p>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
