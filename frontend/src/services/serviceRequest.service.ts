import api from '@/lib/axios';
import type { ApiResponse, CreateServiceRequestData, ServiceRequest, PaginatedResponse } from '@/types';

export const serviceRequestService = {
  async create(data: CreateServiceRequestData): Promise<ServiceRequest> {
    const res = await api.post<ApiResponse<ServiceRequest>>('/service-requests', data);
    return res.data.data;
  },

  async getMy(page = 1, limit = 10): Promise<PaginatedResponse<ServiceRequest>> {
    const res = await api.get<ApiResponse<PaginatedResponse<ServiceRequest>>>('/service-requests/my', { params: { page, limit } });
    return res.data.data;
  },

  async getAvailable(page = 1, limit = 10): Promise<PaginatedResponse<ServiceRequest>> {
    const res = await api.get<ApiResponse<PaginatedResponse<ServiceRequest>>>('/service-requests/available', { params: { page, limit } });
    return res.data.data;
  },

  async getById(id: string): Promise<ServiceRequest> {
    const res = await api.get<ApiResponse<ServiceRequest>>(`/service-requests/${id}`);
    return res.data.data;
  },

  async cancel(id: string): Promise<ServiceRequest> {
    const res = await api.patch<ApiResponse<ServiceRequest>>(`/service-requests/${id}/cancel`);
    return res.data.data;
  },
};
