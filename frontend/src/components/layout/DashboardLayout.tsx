import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';
import {
  Home, FileText, ClipboardList, CreditCard, Star,
  Users, Briefcase, ShieldAlert, Menu, X, LogOut,
  Wrench, Search, Plus, Compass, Bell, ChevronRight,
  Zap,
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
    { label: 'Usuários', to: '/admin/usuarios', icon: <Users className="h-4 w-4" /> },
    { label: 'Prestadores', to: '/admin/prestadores', icon: <Briefcase className="h-4 w-4" /> },
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

  // Link do logo aponta para o dashboard do papel correto
  const homePath =
    user?.role === 'client' ? '/cliente' :
    user?.role === 'provider' ? '/prestador' : '/admin';

  return (
    <div className="relative flex h-full flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1530 50%, #0a1428 100%)' }}>
      {/* Background orbs */}
      <div className="orb w-48 h-48 bg-emerald-500 -top-12 -left-12" />
      <div className="orb w-32 h-32 bg-blue-600 top-1/2 -right-8" />
      <div className="orb w-24 h-24 bg-violet-600 bottom-20 -left-6" />

      {/* Logo */}
      <div className="relative z-10 flex items-center justify-between px-5 py-5 border-b border-white/5">
        <Link to={homePath} className="flex items-center gap-3 group" onClick={onClose}>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg glow-green group-hover:scale-105 transition-transform">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">MãoCerta</span>
            <div className="text-[10px] text-emerald-400/70 font-medium tracking-wider uppercase">Platform</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-white/30 hover:text-white md:hidden p-1 transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Menu principal
        </p>

        {navItems.map((item) =>
          item.disabled ? (
            <span
              key={item.label}
              className="sidebar-link cursor-not-allowed opacity-25"
              title="Em breve"
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <span className="text-[9px] bg-white/8 px-2 py-0.5 rounded-full font-semibold tracking-widest uppercase">Breve</span>
            </span>
          ) : item.highlight ? (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'sidebar-link rounded-xl relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 hover:from-emerald-500/20 hover:to-teal-500/15 border border-emerald-500/10 hover:border-emerald-500/25'
                )
              }
            >
              <Zap className="h-4 w-4" />
              {item.label}
              <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />
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
      <div className="relative z-10 border-t border-white/5 px-4 py-4">
        <div className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-default">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white text-sm font-bold shadow-md">
            {user ? getInitials(user.name) : '?'}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/35 truncate">{roleLabels[user?.role ?? ''] ?? user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform" />
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
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 border-r border-white/5">
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
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 h-full w-64 flex flex-col border-r border-white/5"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 px-4 sm:px-6"
          style={{ background: 'rgba(10, 15, 30, 0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white/30 hover:text-white md:hidden transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-white/40">{roleLabels[user?.role ?? ''] ?? ''}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="h-4.5 w-4.5 h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
            </button>

            <div className="h-6 w-px bg-white/8" />

            {/* User info */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white/80">{user?.name}</p>
                <p className="text-xs text-white/30">{user?.email}</p>
              </div>
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white text-sm font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform">
                {user ? getInitials(user.name) : '?'}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1530 60%, #080e1c 100%)' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="min-h-full p-4 sm:p-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
