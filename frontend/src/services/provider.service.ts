import api from '@/lib/axios';
import type { ProviderCard, ProviderSearchResponse } from '@/types';

export type { ProviderCard };

export const providerService = {
  async search(params: { city?: string; category?: string; page?: number; limit?: number }): Promise<ProviderSearchResponse> {
    const res = await api.get('/providers/search', { params });
    return res.data.data;
  },
};
