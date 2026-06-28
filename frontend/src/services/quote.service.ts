import api from '@/lib/axios';
import type { ApiResponse, CreateQuoteData, Order, Quote, PaginatedResponse } from '@/types';

export const quoteService = {
  async create(data: CreateQuoteData): Promise<Quote> {
    const res = await api.post<ApiResponse<Quote>>('/quotes', data);
    return res.data.data;
  },

  async getMy(page = 1, limit = 10): Promise<PaginatedResponse<Quote>> {
    const res = await api.get<ApiResponse<PaginatedResponse<Quote>>>('/quotes/my', { params: { page, limit } });
    return res.data.data;
  },

  async getByRequest(serviceRequestId: string): Promise<Quote[]> {
    const res = await api.get<ApiResponse<Quote[]>>(`/quotes/request/${serviceRequestId}`);
    return res.data.data;
  },

  async accept(quoteId: string): Promise<Order> {
    const res = await api.patch<ApiResponse<Order>>(`/quotes/${quoteId}/accept`);
    return res.data.data;
  },

  async reject(quoteId: string): Promise<Quote> {
    const res = await api.patch<ApiResponse<Quote>>(`/quotes/${quoteId}/reject`);
    return res.data.data;
  },
};
