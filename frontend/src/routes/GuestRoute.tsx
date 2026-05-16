import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingThree } from "@/components/loading";


const GuestRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingThree/>;

  // If already logged in → go to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
