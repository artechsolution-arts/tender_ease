import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "@/store/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === "vendor" ? "/vendor-dashboard" : "/"} replace />;
  }

  return <>{children}</>;
}