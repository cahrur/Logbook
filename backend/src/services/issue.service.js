const issueRepo = require('../repositories/issue.repository');
const moduleRepo = require('../repositories/module.repository');
const { NotFoundError } = require('../utils/errors');

const issueService = {
  async listByModule(moduleId) {
    const found = await moduleRepo.findById(moduleId);
    if (!found) throw new NotFoundError('Modul tidak ditemukan');
    return issueRepo.listByModule(moduleId);
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
