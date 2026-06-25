import api from '@/lib/axios';
import type { ApiResponse, CreateServiceRequestData, ServiceRequest } from '@/types';

export const serviceRequestService = {
  async create(data: CreateServiceRequestData): Promise<ServiceRequest> {
    const res = await api.post<ApiResponse<ServiceRequest>>('/service-requests', data);
    return res.data.data;
  },

  async getMy(): Promise<ServiceRequest[]> {
    const res = await api.get<ApiResponse<ServiceRequest[]>>('/service-requests/my');
    return res.data.data;
  },

  async getAvailable(): Promise<ServiceRequest[]> {
    const res = await api.get<ApiResponse<ServiceRequest[]>>('/service-requests/available');
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
