import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Extrai o payload de { success, data } automaticamente
    if (response.data?.success === true && 'data' in response.data) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error: AxiosError<{ error?: string; message?: string; code?: string }>) => {
    if (error.response?.status === 401) {
      storage.removeToken();
      window.location.href = '/login';
    }

    const message =
      error.response?.data?.error ??
      error.response?.data?.message ??
      'Ocorreu um erro. Tente novamente.';

    return Promise.reject(new Error(message));
  }
);
