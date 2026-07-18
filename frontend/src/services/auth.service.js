import { api } from '@/lib/api';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data; // { accessToken, user }
  },

  async refresh() {
    const { data } = await api.post('/auth/refresh');
    return data.data; // { accessToken, user }
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async listUsers() {
    const { data } = await api.get('/auth/users');
    return data.data;
  },

  async assignees() {
    const { data } = await api.get('/auth/assignees');
    return data.data;
  },

  async createUser(payload) {
    const { data } = await api.post('/auth/users', payload);
    return data.data;
  },
};
