import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'client') return <Navigate to="/cliente" replace />;
  if (user.role === 'provider') return <Navigate to="/prestador" replace />;
  return <Navigate to="/admin" replace />;
}
