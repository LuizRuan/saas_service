import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  withCredentials: true,
});

let isRefreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const url: string = originalRequest?.url ?? '';

    if (error.response?.status === 401 && !originalRequest._retry && !url.includes('/auth/')) {
      originalRequest._retry = true;
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          await api.post('/auth/refresh');
          isRefreshing = false;
        }
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
