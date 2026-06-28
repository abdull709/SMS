import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from '../components/ui/Loader.jsx';

export function ProtectedRoute({ roles, requireSuperAdmin = false }) {
  const { user, booting, isAuthenticated } = useAuth();
  const location = useLocation();

  if (booting) {
    return <Loader fullScreen label="Loading workspace" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireSuperAdmin && !user.isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
