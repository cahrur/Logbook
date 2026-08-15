const issueRepo = require('../repositories/issue.repository');
const moduleRepo = require('../repositories/module.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');

const issueService = {
  async list(filters) {
    if (!filters.moduleId && !filters.assigneeId) {
      throw new ValidationError('module_id atau assignee_id wajib diisi');
    }
    if (filters.moduleId) {
      const found = await moduleRepo.findById(filters.moduleId);
      if (!found) throw new NotFoundError('Modul tidak ditemukan');
    }
    return issueRepo.list(filters);
  },

  async getById(id) {
    const issue = await issueRepo.findById(id);
    if (!issue) throw new NotFoundError('Issue tidak ditemukan');
    return issue;
  },

  async create(data, userId) {
    const found = await moduleRepo.findById(data.module_id);
    if (!found) throw new NotFoundError('Modul tidak ditemukan');
    return issueRepo.create({ ...data, created_by: userId });
  },

  async update(id, data) {
    const updated = await issueRepo.update(id, data);
    if (!updated) throw new NotFoundError('Issue tidak ditemukan');
    return issueRepo.findById(id);
  },

  async remove(id) {
    const deleted = await issueRepo.remove(id);
    if (!deleted) throw new NotFoundError('Issue tidak ditemukan');
  },
};

module.exports = issueService;
