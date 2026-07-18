import { api } from '@/lib/api';

export const issueImageService = {
  async list(issueId) {
    const { data } = await api.get('/issue-images', { params: { issue_id: issueId } });
    return data.data;
  },
  async upload(issueId, file) {
    const form = new FormData();
    form.append('issue_id', issueId);
    form.append('image', file);
    const { data } = await api.post('/issue-images', form);
    return data.data;
  },
  async remove(id) {
    await api.delete(`/issue-images/${id}`);
  },
  // Auth-protected image → fetched as a blob for display / new-tab preview.
  async fetchBlob(id) {
    const res = await api.get(`/issue-images/${id}`, { responseType: 'blob' });
    return res.data;
  },
};
