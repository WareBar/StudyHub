import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingThree } from "@/components/loading";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  // Optional: while checking auth
  if (isLoading) return <LoadingThree/>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
