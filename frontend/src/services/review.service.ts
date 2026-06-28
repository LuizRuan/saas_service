import api from '@/lib/axios';
import type { ApiResponse, Review, CreateReviewData, PaginatedResponse } from '@/types';

export const reviewService = {
  create: async (data: CreateReviewData): Promise<Review> => {
    const res = await api.post<ApiResponse<Review>>('/reviews', data);
    return res.data.data;
  },
  getMy: async (page = 1, limit = 10): Promise<PaginatedResponse<Review>> => {
    const res = await api.get<ApiResponse<PaginatedResponse<Review>>>('/reviews/my', { params: { page, limit } });
    return res.data.data;
  },
  getByProvider: async (providerId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review>> => {
    const res = await api.get<ApiResponse<PaginatedResponse<Review>>>(`/reviews/provider/${providerId}`, { params: { page, limit } });
    return res.data.data;
  },
};
