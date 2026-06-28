import api from '@/lib/axios';
import type { ApiResponse, RegisterClientData, RegisterProviderData, User } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const res = await api.post<ApiResponse<{ user: User }>>('/auth/login', { email, password });
    return res.data.data.user;
  },

  async registerClient(data: RegisterClientData): Promise<User> {
    const res = await api.post<ApiResponse<{ user: User }>>('/auth/register/client', data);
    return res.data.data.user;
  },

  async registerProvider(data: RegisterProviderData): Promise<User> {
    const res = await api.post<ApiResponse<{ user: User }>>('/auth/register/provider', data);
    return res.data.data.user;
  },

  async me(options?: { timeout?: number }): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User; profile: unknown }>>('/auth/me', { timeout: options?.timeout });
    return res.data.data.user;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },
};
