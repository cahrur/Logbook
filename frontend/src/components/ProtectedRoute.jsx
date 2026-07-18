import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CenteredSpinner } from '@/components/ui/Misc';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { ready, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <CenteredSpinner label="Menyiapkan sesi…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
