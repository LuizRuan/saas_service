import api from '@/lib/axios';

export interface ProviderCard {
  _id: string;
  userId: { _id: string; name: string; email: string; city: string; state: string };
  professionalName: string;
  bio?: string;
  categories: { _id: string; name: string; slug: string }[];
  cities: string[];
  plan: string;
  status: string;
  averageRating: number;
  reviewCount: number;
}

export interface ProviderSearchResult {
  providers: ProviderCard[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const providerService = {
  async search(params: { city?: string; category?: string; page?: number; limit?: number }): Promise<ProviderSearchResult> {
    const res = await api.get('/providers/search', { params });
    return res.data.data;
  },
};
