import { api } from './api';
import type { AuthUser, LoginInput, LoginResponse, RegisterClientInput, RegisterProviderInput } from '../types/auth';

export const authService = {
  async registerClient(body: RegisterClientInput): Promise<LoginResponse> {
    const { data } = await api.post('/auth/register/client', body);
    return data as LoginResponse;
  },

  async registerProvider(body: RegisterProviderInput): Promise<LoginResponse> {
    const { data } = await api.post('/auth/register/provider', body);
    return data as LoginResponse;
  },

  async login(body: LoginInput): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', body);
    return data as LoginResponse;
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await api.get('/auth/me');
    const payload = data as { user: AuthUser };
    return payload.user;
  },
};
