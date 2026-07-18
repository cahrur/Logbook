import { api } from '@/lib/api';

export const fileService = {
  async list(moduleId) {
    const { data } = await api.get('/files', { params: { module_id: moduleId } });
    return data.data;
  },
  async upload(moduleId, file) {
    const form = new FormData();
    form.append('module_id', moduleId);
    form.append('file', file);
    // Let the browser/axios set the multipart boundary automatically.
    const { data } = await api.post('/files', form);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/files/${id}`);
  },
  // Fetches the PDF as a blob (with auth) so it can be opened in a new tab.
  async fetchBlob(id) {
    const res = await api.get(`/files/${id}`, { responseType: 'blob' });
    return res.data;
  },
};
