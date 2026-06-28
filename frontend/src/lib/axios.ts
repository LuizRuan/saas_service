import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  withCredentials: true,
});

// Single shared refresh promise — all concurrent 401s await the same refresh attempt.
// Using a promise reference instead of a boolean flag ensures waiting callers
// actually retry only after the refresh resolves, not immediately.
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const url: string = originalRequest?.url ?? '';

    if (error.response?.status === 401 && !originalRequest._retry && !url.includes('/auth/')) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh').then(
            () => { refreshPromise = null; },
            (err) => { refreshPromise = null; return Promise.reject(err); },
          );
        }
        await refreshPromise;
        return api(originalRequest);
      } catch {
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
