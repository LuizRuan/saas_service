import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { RoleRedirect } from '@/components/shared/RoleRedirect';

import { LandingPage } from '@/pages/public/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ClientDashboardPage } from '@/pages/client/DashboardPage';
import { ExplorePage } from '@/pages/client/ExplorePage';
import { MyRequestsPage } from '@/pages/client/MyRequestsPage';
import { NewRequestPage } from '@/pages/client/NewRequestPage';
import { RequestDetailPage } from '@/pages/client/RequestDetailPage';
import { MyOrdersPage } from '@/pages/client/MyOrdersPage';
import { OrderDetailPage } from '@/pages/client/OrderDetailPage';
import { ClientPaymentsPage } from '@/pages/client/ClientPaymentsPage';
import { ProviderDashboardPage } from '@/pages/provider/DashboardPage';
import { AvailableRequestsPage } from '@/pages/provider/AvailableRequestsPage';
import { ProviderRequestDetailPage } from '@/pages/provider/ProviderRequestDetailPage';
import { MyQuotesPage } from '@/pages/provider/MyQuotesPage';
import { ProviderOrdersPage } from '@/pages/provider/ProviderOrdersPage';
import { ProviderOrderDetailPage } from '@/pages/provider/ProviderOrderDetailPage';
import { AdminDashboardPage } from '@/pages/admin/DashboardPage';
import { AdminUsersPage } from '@/pages/admin/UsersPage';
import { AdminProvidersPage } from '@/pages/admin/ProvidersPage';
import { AdminServiceRequestsPage } from '@/pages/admin/ServiceRequestsPage';
import { AdminOrdersPage } from '@/pages/admin/OrdersPage';
import { AdminDisputasPage } from '@/pages/admin/DisputasPage';
import { AdminPaymentsPage } from '@/pages/admin/PaymentsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          </Route>

          {/* Cliente */}
          <Route element={<ProtectedRoute roles={['client']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/cliente" element={<ClientDashboardPage />} />
              <Route path="/cliente/explorar" element={<ExplorePage />} />
              <Route path="/cliente/solicitacoes" element={<MyRequestsPage />} />
              <Route path="/cliente/solicitacoes/nova" element={<NewRequestPage />} />
              <Route path="/cliente/solicitacoes/:id" element={<RequestDetailPage />} />
              <Route path="/cliente/ordens" element={<MyOrdersPage />} />
              <Route path="/cliente/ordens/:id" element={<OrderDetailPage />} />
              <Route path="/cliente/pagamentos" element={<ClientPaymentsPage />} />
            </Route>
          </Route>

          {/* Prestador */}
          <Route element={<ProtectedRoute roles={['provider']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/prestador" element={<ProviderDashboardPage />} />
              <Route path="/prestador/pedidos" element={<AvailableRequestsPage />} />
              <Route path="/prestador/pedidos/:id" element={<ProviderRequestDetailPage />} />
              <Route path="/prestador/orcamentos" element={<MyQuotesPage />} />
              <Route path="/prestador/ordens" element={<ProviderOrdersPage />} />
              <Route path="/prestador/ordens/:id" element={<ProviderOrderDetailPage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/usuarios" element={<AdminUsersPage />} />
              <Route path="/admin/prestadores" element={<AdminProvidersPage />} />
              <Route path="/admin/solicitacoes" element={<AdminServiceRequestsPage />} />
              <Route path="/admin/ordens" element={<AdminOrdersPage />} />
              <Route path="/admin/disputas" element={<AdminDisputasPage />} />
              <Route path="/admin/pagamentos" element={<AdminPaymentsPage />} />
            </Route>
          </Route>

          {/* Redirecionar usuários logados para seu dashboard */}
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Qualquer outra rota */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
