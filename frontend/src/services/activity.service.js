import { api } from '@/lib/api';

export const activityService = {
  async list(filters = {}) {
    const params = {};
    if (filters.module_id) params.module_id = filters.module_id;
    if (filters.category) params.category = filters.category;
    if (filters.created_by) params.created_by = filters.created_by;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.is_task) params.is_task = filters.is_task;
    if (filters.task_status) params.task_status = filters.task_status;
    if (filters.limit) params.limit = filters.limit;
    const { data } = await api.get('/activities', { params });
    return data.data;
  },
  async create(payload) {
    const { data } = await api.post('/activities', payload);
    return data.data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/activities/${id}`, payload);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/activities/${id}`);
  },
};

export const dashboardService = {
  async overview() {
    const { data } = await api.get('/dashboard');
    return data.data;
  },
};
