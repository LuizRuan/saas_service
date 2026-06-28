import api from '@/lib/axios';
import type { ApiResponse, Order, PaginatedResponse } from '@/types';

export const orderService = {
  async getMy(page = 1, limit = 10): Promise<PaginatedResponse<Order>> {
    const res = await api.get<ApiResponse<PaginatedResponse<Order>>>('/orders/my', { params: { page, limit } });
    return res.data.data;
  },

  async getById(id: string): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return res.data.data;
  },

  async updatePhotos(id: string, type: 'before' | 'after', files: File[]): Promise<Order> {
    const form = new FormData();
    form.append('type', type);
    files.forEach(f => form.append('photos', f));
    const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async updateSignature(id: string, type: 'client' | 'provider', signature: string): Promise<Order> {
    const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/signatures`, { type, signature });
    return res.data.data;
  },

  async approveCompletion(id: string): Promise<Order> {
    const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/approve-completion`);
    return res.data.data;
  },
};
