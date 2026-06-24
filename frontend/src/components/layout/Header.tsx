import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/prestador/dashboard' : '/cliente';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-primary-800 text-xl">
            <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            MãoCerta
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/buscar" className="text-sm text-surface-700 hover:text-primary-800 transition-colors">
              Encontrar prestadores
            </Link>
            <Link to="/cadastro/prestador" className="text-sm text-surface-700 hover:text-primary-800 transition-colors">
              Seja um prestador
            </Link>
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate(dashboardPath)}>
                  Meu painel
                </Button>
                <button onClick={logout} className="flex items-center gap-2 text-sm text-surface-600 hover:text-surface-800">
                  <Avatar name={user.name} size="sm" />
                </button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Entrar
                </Button>
                <Button size="sm" onClick={() => navigate('/cadastro/cliente')}>
                  Criar conta
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-surface-600 hover:bg-surface-100"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white px-4 py-4 flex flex-col gap-3">
          <Link to="/buscar" className="text-sm text-surface-700 py-2" onClick={() => setMobileOpen(false)}>
            Encontrar prestadores
          </Link>
          <Link to="/cadastro/prestador" className="text-sm text-surface-700 py-2" onClick={() => setMobileOpen(false)}>
            Seja um prestador
          </Link>
          <hr className="border-surface-200" />
          {isAuthenticated ? (
            <>
              <Button variant="secondary" size="sm" fullWidth onClick={() => { navigate(dashboardPath); setMobileOpen(false); }}>
                Meu painel
              </Button>
              <Button variant="ghost" size="sm" fullWidth onClick={() => { logout(); setMobileOpen(false); }}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                Entrar
              </Button>
              <Button size="sm" fullWidth onClick={() => { navigate('/cadastro/cliente'); setMobileOpen(false); }}>
                Criar conta
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
