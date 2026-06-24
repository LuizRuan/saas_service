import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function AuthWrapper() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

// Public pages
import LandingPage from '../pages/public/LandingPage';
import SearchPage from '../pages/public/SearchPage';
import CategoryPage from '../pages/public/CategoryPage';
import ProviderProfilePage from '../pages/public/ProviderProfilePage';
import LoginPage from '../pages/public/LoginPage';
import RegisterClientPage from '../pages/public/RegisterClientPage';
import RegisterProviderPage from '../pages/public/RegisterProviderPage';

// Client pages
import ClientDashboard from '../pages/client/ClientDashboard';

// Provider pages
import ProviderDashboard from '../pages/provider/ProviderDashboard';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-surface-800">{title}</h1>
      <div className="bg-white rounded-xl border border-surface-200 p-12 text-center">
        <p className="text-surface-600">Esta página será implementada nas próximas etapas.</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <AuthWrapper />,
    children: [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/buscar', element: <SearchPage /> },
      { path: '/categoria/:slug', element: <CategoryPage /> },
      { path: '/prestador/:id', element: <ProviderProfilePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/cadastro/cliente', element: <RegisterClientPage /> },
      { path: '/cadastro/prestador', element: <RegisterProviderPage /> },
    ],
  },

  // Client routes
  {
    element: <ProtectedRoute allowedRoles={['client']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/cliente', element: <ClientDashboard /> },
          { path: '/cliente/solicitar', element: <ComingSoon title="Nova Solicitação" /> },
          { path: '/cliente/solicitacoes', element: <ComingSoon title="Minhas Solicitações" /> },
          { path: '/cliente/solicitacoes/:id', element: <ComingSoon title="Detalhe da Solicitação" /> },
          { path: '/cliente/pagamento/:orderId/sinal', element: <ComingSoon title="Pagamento do Sinal" /> },
          { path: '/cliente/ordens', element: <ComingSoon title="Ordens de Serviço" /> },
          { path: '/cliente/ordens/:id', element: <ComingSoon title="Detalhe da Ordem" /> },
          { path: '/cliente/ordens/:id/aprovar', element: <ComingSoon title="Aprovar Conclusão" /> },
          { path: '/cliente/ordens/:id/pagamento-final', element: <ComingSoon title="Pagamento Final" /> },
          { path: '/cliente/ordens/:id/avaliar', element: <ComingSoon title="Avaliar Prestador" /> },
        ],
      },
    ],
  },

  // Provider routes
  {
    element: <ProtectedRoute allowedRoles={['provider']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/prestador/dashboard', element: <ProviderDashboard /> },
          { path: '/prestador/perfil', element: <ComingSoon title="Meu Perfil Profissional" /> },
          { path: '/prestador/pedidos', element: <ComingSoon title="Pedidos Disponíveis" /> },
          { path: '/prestador/orcamentos', element: <ComingSoon title="Meus Orçamentos" /> },
          { path: '/prestador/agenda', element: <ComingSoon title="Minha Agenda" /> },
          { path: '/prestador/ordens', element: <ComingSoon title="Ordens de Serviço" /> },
          { path: '/prestador/ordens/:id', element: <ComingSoon title="Executar Ordem" /> },
          { path: '/prestador/financeiro', element: <ComingSoon title="Financeiro" /> },
          { path: '/prestador/avaliacoes', element: <ComingSoon title="Avaliações Recebidas" /> },
        ],
      },
    ],
  },

  // Admin routes
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/admin', element: <AdminDashboard /> },
          { path: '/admin/usuarios', element: <ComingSoon title="Gerenciar Usuários" /> },
          { path: '/admin/prestadores', element: <ComingSoon title="Prestadores Pendentes" /> },
          { path: '/admin/categorias', element: <ComingSoon title="Categorias" /> },
          { path: '/admin/solicitacoes', element: <ComingSoon title="Solicitações" /> },
          { path: '/admin/ordens', element: <ComingSoon title="Ordens" /> },
          { path: '/admin/pagamentos', element: <ComingSoon title="Pagamentos" /> },
          { path: '/admin/disputas', element: <ComingSoon title="Disputas" /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
  ], // end AuthWrapper children
  }, // end AuthWrapper
]);
