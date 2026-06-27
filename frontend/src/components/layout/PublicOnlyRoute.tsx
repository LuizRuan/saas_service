import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (user) {
    if (user.role === 'client') return <Navigate to="/cliente" replace />;
    if (user.role === 'provider') return <Navigate to="/prestador" replace />;
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
