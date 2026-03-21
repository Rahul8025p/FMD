import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to={role === "ADMIN" ? "/admin/login" : "/login"} replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to={userRole === "ADMIN" ? "/admin" : "/user"} replace />;
  }

  return children;
}
