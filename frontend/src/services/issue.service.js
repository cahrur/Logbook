import { api } from '@/lib/api';

export const issueService = {
  async listByModule(moduleId) {
    const { data } = await api.get('/issues', { params: { module_id: moduleId } });
    return data.data;
  },
  async create(payload) {
    const { data } = await api.post('/issues', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/issues/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/issues/${id}`);
  },
};
