import { Navigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isOtpVerified } = useUserStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" />;
  }

  if (user.role === "admin" && !isOtpVerified) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;