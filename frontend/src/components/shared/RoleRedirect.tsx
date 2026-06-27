import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import type { UserRole } from '@/types';

const ROLE_PATHS: Record<UserRole, string> = {
  client: '/cliente',
  provider: '/prestador',
  admin: '/admin',
};

export function RoleRedirect() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #050912 0%, #0a0f1e 100%)' }}>
        <Spinner size="lg" className="text-emerald-400" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const dest = ROLE_PATHS[user.role];
  if (dest) return <Navigate to={dest} replace />;

  logout();
  return <Navigate to="/login" replace />;
}
