import { api } from '@/lib/api';

export const moduleService = {
  async list() {
    const { data } = await api.get('/modules');
    return data.data;
  },
  async getById(id) {
    const { data } = await api.get(`/modules/${id}`);
    return data.data;
  },
  async create(payload) {
    const { data } = await api.post('/modules', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/modules/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/modules/${id}`);
  },
};
