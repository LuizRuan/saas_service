import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, FileText, PlusCircle, ClipboardList, Calendar,
  Users, Settings, Star, DollarSign, ShieldAlert, Tag, AlertTriangle,
  Wrench, X, User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

interface SidebarProps {
  open: boolean;
  onClose(): void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const clientNav: NavItem[] = [
  { to: '/cliente', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { to: '/cliente/solicitar', label: 'Nova Solicitação', icon: <PlusCircle className="w-4 h-4" /> },
  { to: '/cliente/solicitacoes', label: 'Minhas Solicitações', icon: <FileText className="w-4 h-4" /> },
  { to: '/cliente/ordens', label: 'Ordens de Serviço', icon: <ClipboardList className="w-4 h-4" /> },
];

const providerNav: NavItem[] = [
  { to: '/prestador/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { to: '/prestador/perfil', label: 'Meu Perfil', icon: <User className="w-4 h-4" /> },
  { to: '/prestador/pedidos', label: 'Pedidos Disponíveis', icon: <FileText className="w-4 h-4" /> },
  { to: '/prestador/orcamentos', label: 'Meus Orçamentos', icon: <DollarSign className="w-4 h-4" /> },
  { to: '/prestador/agenda', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
  { to: '/prestador/ordens', label: 'Ordens de Serviço', icon: <ClipboardList className="w-4 h-4" /> },
  { to: '/prestador/financeiro', label: 'Financeiro', icon: <DollarSign className="w-4 h-4" /> },
  { to: '/prestador/avaliacoes', label: 'Avaliações', icon: <Star className="w-4 h-4" /> },
];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { to: '/admin/usuarios', label: 'Usuários', icon: <Users className="w-4 h-4" /> },
  { to: '/admin/prestadores', label: 'Prestadores', icon: <Wrench className="w-4 h-4" /> },
  { to: '/admin/categorias', label: 'Categorias', icon: <Tag className="w-4 h-4" /> },
  { to: '/admin/solicitacoes', label: 'Solicitações', icon: <FileText className="w-4 h-4" /> },
  { to: '/admin/ordens', label: 'Ordens', icon: <ClipboardList className="w-4 h-4" /> },
  { to: '/admin/pagamentos', label: 'Pagamentos', icon: <DollarSign className="w-4 h-4" /> },
  { to: '/admin/disputas', label: 'Disputas', icon: <AlertTriangle className="w-4 h-4" /> },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const navItems =
    user?.role === 'admin' ? adminNav : user?.role === 'provider' ? providerNav : clientNav;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-primary-900 text-white">
      {/* Brand */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </div>
          MãoCerta
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/10">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/cliente' || item.to === '/prestador/dashboard' || item.to === '/admin'}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary-700 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          {user && <Avatar name={user.name} size="sm" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Settings className="w-3 h-3" />
          Sair da conta
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Sidebar mobile (drawer) */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-60 flex flex-col lg:hidden transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
