import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/layout/PublicOnlyRoute';
import { RoleRedirect } from '@/components/shared/RoleRedirect';
import { Spinner } from '@/components/shared/Spinner';

// Public pages
const LandingPage = React.lazy(() => import('@/pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

// Client pages
const ClientDashboardPage = React.lazy(() => import('@/pages/client/DashboardPage').then(m => ({ default: m.ClientDashboardPage })));
const ExplorePage = React.lazy(() => import('@/pages/client/ExplorePage').then(m => ({ default: m.ExplorePage })));
const MyRequestsPage = React.lazy(() => import('@/pages/client/MyRequestsPage').then(m => ({ default: m.MyRequestsPage })));
const NewRequestPage = React.lazy(() => import('@/pages/client/NewRequestPage').then(m => ({ default: m.NewRequestPage })));
const RequestDetailPage = React.lazy(() => import('@/pages/client/RequestDetailPage').then(m => ({ default: m.RequestDetailPage })));
const MyOrdersPage = React.lazy(() => import('@/pages/client/MyOrdersPage').then(m => ({ default: m.MyOrdersPage })));
const OrderDetailPage = React.lazy(() => import('@/pages/client/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })));
const ClientPaymentsPage = React.lazy(() => import('@/pages/client/ClientPaymentsPage').then(m => ({ default: m.ClientPaymentsPage })));
const ReviewPage = React.lazy(() => import('@/pages/client/ReviewPage').then(m => ({ default: m.ReviewPage })));
const MyDisputesPage = React.lazy(() => import('@/pages/client/MyDisputesPage').then(m => ({ default: m.MyDisputesPage })));

// Provider pages
const ProviderDashboardPage = React.lazy(() => import('@/pages/provider/DashboardPage').then(m => ({ default: m.ProviderDashboardPage })));
const AvailableRequestsPage = React.lazy(() => import('@/pages/provider/AvailableRequestsPage').then(m => ({ default: m.AvailableRequestsPage })));
const ProviderRequestDetailPage = React.lazy(() => import('@/pages/provider/ProviderRequestDetailPage').then(m => ({ default: m.ProviderRequestDetailPage })));
const MyQuotesPage = React.lazy(() => import('@/pages/provider/MyQuotesPage').then(m => ({ default: m.MyQuotesPage })));
const ProviderOrdersPage = React.lazy(() => import('@/pages/provider/ProviderOrdersPage').then(m => ({ default: m.ProviderOrdersPage })));
const ProviderOrderDetailPage = React.lazy(() => import('@/pages/provider/ProviderOrderDetailPage').then(m => ({ default: m.ProviderOrderDetailPage })));
const MyReviewsPage = React.lazy(() => import('@/pages/provider/MyReviewsPage').then(m => ({ default: m.MyReviewsPage })));

// Admin pages
const AdminDashboardPage = React.lazy(() => import('@/pages/admin/DashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = React.lazy(() => import('@/pages/admin/UsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminOrdersPage = React.lazy(() => import('@/pages/admin/OrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminDisputasPage = React.lazy(() => import('@/pages/admin/DisputasPage').then(m => ({ default: m.AdminDisputasPage })));
const AdminPaymentsPage = React.lazy(() => import('@/pages/admin/PaymentsPage').then(m => ({ default: m.AdminPaymentsPage })));
const AdminServiceRequestsPage = React.lazy(() => import('@/pages/admin/ServiceRequestsPage').then(m => ({ default: m.AdminServiceRequestsPage })));
const AdminProvidersPage = React.lazy(() => import('@/pages/admin/ProvidersPage').then(m => ({ default: m.AdminProvidersPage })));

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>
            {/* Rotas públicas — redireciona para dashboard se logado */}
            <Route element={<PublicOnlyRoute />}>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<RegisterPage />} />
                <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
              </Route>
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
                <Route path="/cliente/ordens/:id/avaliar" element={<ReviewPage />} />
                <Route path="/cliente/pagamentos" element={<ClientPaymentsPage />} />
                <Route path="/cliente/disputas" element={<MyDisputesPage />} />
                <Route path="/cliente/avaliacoes" element={<Navigate to="/cliente" replace />} />
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
                <Route path="/prestador/avaliacoes" element={<MyReviewsPage />} />
              </Route>
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/usuarios" element={<AdminUsersPage />} />
                <Route path="/admin/ordens" element={<AdminOrdersPage />} />
                <Route path="/admin/disputas" element={<AdminDisputasPage />} />
                <Route path="/admin/pagamentos" element={<AdminPaymentsPage />} />
                <Route path="/admin/solicitacoes" element={<AdminServiceRequestsPage />} />
                <Route path="/admin/prestadores" element={<AdminProvidersPage />} />
              </Route>
            </Route>

            {/* Reset de senha — acessível mesmo com sessão ativa */}
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

            {/* Redirecionar usuários logados para seu dashboard */}
            <Route path="/dashboard" element={<RoleRedirect />} />

            {/* Qualquer outra rota */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
