import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { paths } from '../../routes';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const token = useAuthStore((s) => s.token);
  const isAdmin = useAuthStore((s) => s.isAdmin());

  if (!token) {
    return <Navigate to={paths.login} replace />;
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to={paths.root} replace />;
  }
  return <>{children}</>;
}
