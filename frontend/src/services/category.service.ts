import api from '@/lib/axios';
import type { ApiResponse, Category } from '@/types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data.data.filter((c) => c.active);
  },
};
