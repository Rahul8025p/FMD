import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import GlobalLanguageSwitcher from "./components/GlobalLanguageSwitcher";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const DiseaseInfo = lazy(() => import("./pages/DiseaseInfo"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const History = lazy(() => import("./pages/History"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminHeatmap = lazy(() => import("./pages/AdminHeatmap"));
const Analyze = lazy(() => import("./pages/Analyze"));
const Result = lazy(() => import("./pages/Result"));

function AppFallback() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-10 w-52 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-56 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-56 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <GlobalLanguageSwitcher />
      <Suspense fallback={<AppFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/disease-info" element={<DiseaseInfo />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/user"
            element={
              <ProtectedRoute role="USER">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analyze"
            element={
              <ProtectedRoute role="USER">
                <Analyze />
              </ProtectedRoute>
            }
          />

          <Route
            path="/result"
            element={
              <ProtectedRoute role="USER">
                <Result />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute role="USER">
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute role="USER">
                <History />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/heatmap"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminHeatmap />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
