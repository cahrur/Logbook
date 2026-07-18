import { api } from '@/lib/api';

export const infoService = {
  async list(moduleId) {
    const { data } = await api.get('/infos', { params: { module_id: moduleId } });
    return data.data;
  },
  async create(payload) {
    const { data } = await api.post('/infos', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/infos/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/infos/${id}`);
  },
};
