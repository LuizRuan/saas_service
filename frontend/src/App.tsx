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
import { ProviderDashboardPage } from '@/pages/provider/DashboardPage';
import { AvailableRequestsPage } from '@/pages/provider/AvailableRequestsPage';
import { ProviderRequestDetailPage } from '@/pages/provider/ProviderRequestDetailPage';
import { MyQuotesPage } from '@/pages/provider/MyQuotesPage';
import { AdminDashboardPage } from '@/pages/admin/DashboardPage';

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
            </Route>
          </Route>

          {/* Prestador */}
          <Route element={<ProtectedRoute roles={['provider']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/prestador" element={<ProviderDashboardPage />} />
              <Route path="/prestador/pedidos" element={<AvailableRequestsPage />} />
              <Route path="/prestador/pedidos/:id" element={<ProviderRequestDetailPage />} />
              <Route path="/prestador/orcamentos" element={<MyQuotesPage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
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
