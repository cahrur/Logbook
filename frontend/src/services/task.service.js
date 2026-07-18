import { api } from '@/lib/api';

export const taskService = {
  async listByModule(moduleId) {
    const { data } = await api.get('/tasks', { params: { module_id: moduleId } });
    return data.data;
  },
  async listMine(userId) {
    const { data } = await api.get('/tasks', { params: { assignee_id: userId } });
    return data.data;
  },
  async create(payload) {
    const { data } = await api.post('/tasks', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/tasks/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/tasks/${id}`);
  },
};
