import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';
import {
  Home,
  FileText,
  ClipboardList,
  CreditCard,
  Star,
  Users,
  Briefcase,
  ShieldAlert,
  Menu,
  X,
  LogOut,
  Wrench,
  Search,
  Plus,
  Compass,
  ChevronRight,
  Bell,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  disabled?: boolean;
  highlight?: boolean;
}

function useNavItems() {
  const { user } = useAuth();
  if (user?.role === 'client') {
    return [
      { label: 'Início', to: '/cliente', icon: <Home className="h-4 w-4" /> },
      { label: 'Nova Solicitação', to: '/cliente/solicitacoes/nova', icon: <Plus className="h-4 w-4" />, highlight: true },
      { label: 'Minhas Solicitações', to: '/cliente/solicitacoes', icon: <FileText className="h-4 w-4" /> },
      { label: 'Explorar categorias', to: '/cliente/explorar', icon: <Compass className="h-4 w-4" /> },
      { label: 'Ordens', to: '/cliente/ordens', icon: <ClipboardList className="h-4 w-4" /> },
      { label: 'Pagamentos', to: '/cliente/pagamentos', icon: <CreditCard className="h-4 w-4" />, disabled: true },
      { label: 'Avaliações', to: '/cliente/avaliacoes', icon: <Star className="h-4 w-4" />, disabled: true },
    ] as NavItem[];
  }
  if (user?.role === 'provider') {
    return [
      { label: 'Início', to: '/prestador', icon: <Home className="h-4 w-4" /> },
      { label: 'Pedidos disponíveis', to: '/prestador/pedidos', icon: <Search className="h-4 w-4" /> },
      { label: 'Meus orçamentos', to: '/prestador/orcamentos', icon: <FileText className="h-4 w-4" /> },
      { label: 'Ordens', to: '/prestador/ordens', icon: <ClipboardList className="h-4 w-4" />, disabled: true },
      { label: 'Avaliações', to: '/prestador/avaliacoes', icon: <Star className="h-4 w-4" />, disabled: true },
    ] as NavItem[];
  }
  return [
    { label: 'Início', to: '/admin', icon: <Home className="h-4 w-4" /> },
    { label: 'Usuários', to: '/admin/usuarios', icon: <Users className="h-4 w-4" />, disabled: true },
    { label: 'Prestadores', to: '/admin/prestadores', icon: <Briefcase className="h-4 w-4" />, disabled: true },
    { label: 'Solicitações', to: '/admin/solicitacoes', icon: <FileText className="h-4 w-4" />, disabled: true },
    { label: 'Ordens', to: '/admin/ordens', icon: <ClipboardList className="h-4 w-4" />, disabled: true },
    { label: 'Pagamentos', to: '/admin/pagamentos', icon: <CreditCard className="h-4 w-4" />, disabled: true },
    { label: 'Disputas', to: '/admin/disputas', icon: <ShieldAlert className="h-4 w-4" />, disabled: true },
  ] as NavItem[];
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = useNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels: Record<string, string> = {
    client: 'Cliente',
    provider: 'Prestador',
    admin: 'Administrador',
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-primary-dark via-primary to-primary">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2.5 text-white group" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/20 group-hover:bg-success/30 transition-colors">
            <Wrench className="h-4 w-4 text-success" />
          </div>
          <span className="font-bold text-lg tracking-tight">MãoCerta</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/50 hover:text-white md:hidden p-1">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Menu</p>
        </div>
        {navItems.map((item) =>
          item.disabled ? (
            <span
              key={item.label}
              className="sidebar-link sidebar-link-inactive cursor-not-allowed opacity-30"
              title="Em breve"
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-md font-medium">Breve</span>
            </span>
          ) : item.highlight ? (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'sidebar-link rounded-xl',
                  isActive
                    ? 'bg-success text-white font-semibold shadow-glow'
                    : 'bg-success/15 text-success-light font-semibold hover:bg-success/25'
                )
              }
            >
              {item.icon}
              {item.label}
              <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-60" />
            </NavLink>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              end
              onClick={onClose}
              className={({ isActive }) =>
                cn('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive')
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 px-4 py-4 bg-black/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white text-sm font-semibold ring-2 ring-white/10">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/50 truncate">{roleLabels[user?.role ?? ''] ?? user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const roleLabels: Record<string, string> = {
    client: 'Área do Cliente',
    provider: 'Área do Prestador',
    admin: 'Painel Administrativo',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 shadow-premium">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 h-full w-64 flex flex-col shadow-premium"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6 shadow-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-primary md:hidden transition-colors p-1 rounded-lg hover:bg-slate-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-800">{roleLabels[user?.role ?? ''] ?? ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50 transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-success ring-2 ring-white" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white text-sm font-semibold shadow-sm">
                {user ? getInitials(user.name) : '?'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
