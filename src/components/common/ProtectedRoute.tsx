import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  requireAdmin?: boolean;
}

export function ProtectedRoute({ requireAdmin = false }: Props) {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

/** Customer account area only: redirects admins to `/admin`, guests to `/login`. */
export function UserAccountRoute() {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
