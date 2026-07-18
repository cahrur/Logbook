import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Access token lives in memory only (never localStorage) — XSS-safe.
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On a 401, try one silent refresh (httpOnly cookie) then retry the request.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.includes('/auth/');
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise =
          refreshPromise ||
          axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
        const res = await refreshPromise;
        refreshPromise = null;
        const newToken = res.data.data.accessToken;
        setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        refreshPromise = null;
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Normalize backend error messages for display.
export function apiErrorMessage(error, fallback = 'Terjadi kesalahan') {
  return error?.response?.data?.message || error?.message || fallback;
}
