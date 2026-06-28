import api from '@/lib/axios';
import type { ApiResponse, Dispute, CreateDisputeData } from '@/types';

export const disputeService = {
  create: async (data: CreateDisputeData): Promise<Dispute> => {
    const res = await api.post<ApiResponse<Dispute>>('/disputes', data);
    return res.data.data;
  },
  getMy: async (): Promise<Dispute[]> => {
    const res = await api.get<ApiResponse<Dispute[]>>('/disputes/my');
    return res.data.data;
  },
  getById: async (id: string): Promise<Dispute> => {
    const res = await api.get<ApiResponse<Dispute>>(`/disputes/${id}`);
    return res.data.data;
  },
};
