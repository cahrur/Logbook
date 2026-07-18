import { api } from '@/lib/api';

export const roadmapService = {
  async list(moduleId) {
    const { data } = await api.get('/roadmap', { params: { module_id: moduleId } });
    return data.data;
  },
  async getById(id) {
    const { data } = await api.get(`/roadmap/${id}`);
    return data.data;
  },
  async create(payload) {
    const { data } = await api.post('/roadmap', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/roadmap/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/roadmap/${id}`);
  },
};
