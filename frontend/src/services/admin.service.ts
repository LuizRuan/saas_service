import api from '@/lib/axios';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'provider' | 'admin';
  status: 'active' | 'blocked';
  city?: string;
  state?: string;
  phone?: string;
  createdAt: string;
}

export interface AdminProvider {
  _id: string;
  professionalName: string;
  document?: string;
  status: 'pending' | 'approved' | 'blocked';
  plan: string;
  cities: string[];
  averageRating: number;
  totalReviews: number;
  completedServices: number;
  createdAt: string;
  userId?: { name: string; email: string; phone?: string; city?: string; state?: string; status?: string };
  categories?: { name: string }[];
}

export interface AdminServiceRequest {
  _id: string;
  description: string;
  city: string;
  neighborhood?: string;
  approximateAddress?: string;
  fullAddress?: string;
  urgency: 'low' | 'medium' | 'high';
  status: string;
  desiredDate?: string;
  createdAt: string;
  clientId?: { name: string; email: string };
  categoryId?: { name: string; slug: string };
  selectedProviderId?: string | null;
}

export interface AdminOrder {
  _id: string;
  status: string;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  createdAt: string;
  clientId?: { name: string; email: string };
  providerId?: { name: string; email: string };
  quoteId?: { totalAmount: number; depositAmount: number; remainingAmount: number };
  serviceRequestId?: string;
}

export interface AdminDispute {
  _id: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved_client' | 'resolved_provider' | 'refunded';
  adminNotes?: string;
  evidencePhotos?: string[];
  createdAt: string;
  openedBy?: { name: string; email: string };
  orderId?: { _id?: string; clientId?: string; providerId?: string; status?: string };
}

export type DisputeStatus = AdminDispute['status'];

export interface AdminPayment {
  _id: string;
  orderId?: string | { _id?: string; status?: string };
  clientId?: string | { _id?: string; name: string; email: string };
  providerId?: string | { _id?: string; name: string; email: string };
  type: 'deposit' | 'remaining' | 'full';
  amount: number;
  platformFee: number;
  providerAmount: number;
  gateway: 'simulated' | 'mercado_pago' | 'asaas' | 'pagarme';
  externalPaymentId?: string;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: string;
}

async function getUsers(limit = 100) {
  const res = await api.get(`/admin/users?limit=${limit}`);
  const d = res.data.data;
  return { users: (d.users ?? d ?? []) as AdminUser[], total: (d.total ?? 0) as number };
}

async function getProviders(limit = 100) {
  const res = await api.get(`/admin/providers?limit=${limit}`);
  const d = res.data.data;
  return { providers: (d.providers ?? d ?? []) as AdminProvider[], total: (d.total ?? 0) as number };
}

async function approveProvider(id: string) {
  const res = await api.patch(`/admin/providers/${id}/approve`);
  return res.data.data as AdminProvider;
}

async function blockProvider(id: string) {
  const res = await api.patch(`/admin/providers/${id}/block`);
  return res.data.data as AdminProvider;
}

async function getServiceRequests(limit = 100) {
  const res = await api.get(`/admin/service-requests?limit=${limit}`);
  const d = res.data.data;
  return { requests: (d.requests ?? d ?? []) as AdminServiceRequest[], total: (d.total ?? 0) as number };
}

async function getOrders(limit = 100) {
  const res = await api.get(`/admin/orders?limit=${limit}`);
  const d = res.data.data;
  return { orders: (d.orders ?? d ?? []) as AdminOrder[], total: (d.total ?? 0) as number };
}

async function getDisputes(limit = 100) {
  const res = await api.get(`/admin/disputes?limit=${limit}`);
  const d = res.data.data;
  return { disputes: (d.disputes ?? d ?? []) as AdminDispute[], total: (d.total ?? 0) as number };
}

async function updateDisputeStatus(id: string, status: DisputeStatus, adminNotes?: string) {
  const res = await api.patch(`/admin/disputes/${id}/status`, { status, adminNotes });
  return res.data.data as AdminDispute;
}

async function getPayments(limit = 200) {
  const res = await api.get(`/admin/payments?limit=${limit}`);
  const d = res.data.data;
  return { payments: (d.payments ?? d ?? []) as AdminPayment[], total: (d.total ?? 0) as number };
}

export const adminService = {
  getUsers,
  getProviders,
  approveProvider,
  blockProvider,
  getServiceRequests,
  getOrders,
  getDisputes,
  updateDisputeStatus,
  getPayments,
};
