import api from '@/lib/axios';
import type { ApiResponse, Order } from '@/types';

export const orderService = {
  async getMy(): Promise<Order[]> {
    const res = await api.get<ApiResponse<Order[]>>('/orders/my');
    return res.data.data;
  },

  async getById(id: string): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },
};
