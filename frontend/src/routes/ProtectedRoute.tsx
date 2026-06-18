import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { OceanBackground } from '@/components/water/OceanBackground';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <OceanBackground />
        <div
          className="h-12 w-12 rounded-full border-2 border-white/20 border-t-[var(--color-aqua)] animate-spin"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
