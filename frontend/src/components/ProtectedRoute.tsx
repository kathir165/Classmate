import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useClasses } from "../context/ClassContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="w-8 h-8 border-2 border-base-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function RequireClass({ children }: { children: React.ReactNode }) {
  const { classes, loading } = useClasses();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-base-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (classes.length === 0) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}
