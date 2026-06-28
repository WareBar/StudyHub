import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingThree } from "@/components/loading";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  // Optional: while checking auth
  if (isLoading) return (  
    <div className="flex items-center justify-center min-h-screen">
      <LoadingThree label="Checking authentication…" />
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
