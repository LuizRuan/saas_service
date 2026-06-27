import api from '@/lib/axios';
import type { ApiResponse, RegisterClientData, RegisterProviderData, User } from '@/types';

interface AuthResult {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/login', { email, password });
    return res.data.data;
  },

  async registerClient(data: RegisterClientData): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/register/client', data);
    return res.data.data;
  },

  async registerProvider(data: RegisterProviderData): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/register/provider', data);
    return res.data.data;
  },

  async me(options?: { timeout?: number }): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me', { timeout: options?.timeout });
    return res.data.data;
  },
};
