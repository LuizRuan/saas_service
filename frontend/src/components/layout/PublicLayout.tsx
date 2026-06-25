import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Wrench, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PublicLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'client') return '/cliente';
    if (user.role === 'provider') return '/prestador';
    return '/admin';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled || !isLanding
            ? 'bg-primary/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 text-white group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/20 group-hover:bg-success/30 transition-colors">
                <Wrench className="h-4 w-4 text-success" />
              </div>
              <span className="text-xl font-bold tracking-tight">MãoCerta</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {isLanding && (
                <>
                  <a href="#como-funciona" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
                    Como funciona
                  </a>
                  <a href="#categorias" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
                    Categorias
                  </a>
                  <a href="#beneficios" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
                    Benefícios
                  </a>
                </>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(getDashboardPath())}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  Meu painel
                </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white/80 hover:text-white text-sm font-medium transition-colors px-3 py-2"
                  >
                    Entrar
                  </Link>
                  <Link to="/cadastro">
                    <Button
                      size="sm"
                      className="bg-success hover:bg-success-dark text-white border-0 shadow-glow"
                    >
                      Cadastrar-se
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white/80 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-primary-dark/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {isLanding && (
                  <>
                    <a href="#como-funciona" className="block text-white/70 hover:text-white text-sm font-medium py-2">
                      Como funciona
                    </a>
                    <a href="#categorias" className="block text-white/70 hover:text-white text-sm font-medium py-2">
                      Categorias
                    </a>
                  </>
                )}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  {user ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(getDashboardPath())}
                      className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                    >
                      Meu painel
                    </Button>
                  ) : (
                    <>
                      <Link to="/login" className="block">
                        <Button variant="ghost" size="sm" className="w-full text-white hover:bg-white/10">
                          Entrar
                        </Button>
                      </Link>
                      <Link to="/cadastro" className="block">
                        <Button size="sm" className="w-full bg-success hover:bg-success-dark text-white border-0">
                          Cadastrar-se
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-primary-dark text-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/20">
                  <Wrench className="h-3.5 w-3.5 text-success" />
                </div>
                <span className="font-bold text-white text-lg">MãoCerta</span>
              </div>
              <p className="text-sm leading-relaxed">
                Plataforma segura de contratação de serviços locais.
                Conectamos clientes a prestadores verificados.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Plataforma</h4>
              <div className="space-y-2 text-sm">
                <a href="#como-funciona" className="block hover:text-white transition-colors">Como funciona</a>
                <a href="#categorias" className="block hover:text-white transition-colors">Categorias</a>
                <a href="#beneficios" className="block hover:text-white transition-colors">Benefícios</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-3">Legal</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-white transition-colors">Termos de uso</a>
                <a href="#" className="block hover:text-white transition-colors">Privacidade</a>
                <a href="#" className="block hover:text-white transition-colors">Contato</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} MãoCerta. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
