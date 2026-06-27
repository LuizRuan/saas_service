import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import type { UserRole } from '@/types';

const ROLE_PATHS: Record<UserRole, string> = {
  client: '/cliente',
  provider: '/prestador',
  admin: '/admin',
};

export function PublicOnlyRoute() {
  const { user, isLoading, logout } = useAuth();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => setSlow(true), 3_000);
    return () => clearTimeout(t);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(135deg, #050912 0%, #0a0f1e 100%)' }}>
        <Spinner size="lg" className="text-emerald-400" />
        {slow && (
          <p className="text-sm text-white/40 text-center max-w-xs">
            Aguardando o servidor iniciar…<br />
            <span className="text-white/25 text-xs">Isso pode levar alguns segundos na primeira vez.</span>
          </p>
        )}
      </div>
    );
  }

  if (user) {
    const dest = ROLE_PATHS[user.role];
    if (dest) return <Navigate to={dest} replace />;
    logout();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
