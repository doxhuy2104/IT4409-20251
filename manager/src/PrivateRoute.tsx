import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from './AuthContext';
import LoadingSpinner from "./Loading";

export default function PrivateRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
