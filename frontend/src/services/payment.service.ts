import api from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface Payment {
  _id: string;
  orderId?: string | { _id?: string; status?: string };
  clientId?: string | { name: string; email: string };
  providerId?: string | { name: string; email: string };
  type: 'deposit' | 'remaining' | 'full';
  amount: number;
  platformFee: number;
  providerAmount: number;
  gateway: 'simulated' | 'mercado_pago' | 'asaas' | 'pagarme';
  externalPaymentId?: string;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: string;
}

async function simulateDeposit(orderId: string): Promise<Payment> {
  const res = await api.post<ApiResponse<Payment>>(`/payments/${orderId}/deposit/simulate`);
  return res.data.data;
}

async function simulateRemaining(orderId: string): Promise<Payment> {
  const res = await api.post<ApiResponse<Payment>>(`/payments/${orderId}/remaining/simulate`);
  return res.data.data;
}

async function getMy(): Promise<Payment[]> {
  const res = await api.get<ApiResponse<Payment[]>>('/payments/my');
  return res.data.data;
}

export const paymentService = { simulateDeposit, simulateRemaining, getMy };
