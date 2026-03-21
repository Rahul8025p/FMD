import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Analyze from "./pages/Analyze";
import Result from "./pages/Result";

import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>

      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />

      {/* User routes */}
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

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
