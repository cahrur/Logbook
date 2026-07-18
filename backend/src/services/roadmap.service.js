const roadmapRepo = require('../repositories/roadmap.repository');
const moduleRepo = require('../repositories/module.repository');
const { NotFoundError } = require('../utils/errors');

const roadmapService = {
  async listByModule(moduleId) {
    const found = await moduleRepo.findById(moduleId);
    if (!found) throw new NotFoundError('Modul tidak ditemukan');
    return roadmapRepo.listByModule(moduleId);
  },

  async getById(id) {
    const step = await roadmapRepo.findById(id);
    if (!step) throw new NotFoundError('Roadmap step tidak ditemukan');
    return step;
  },

  async create(data) {
    const found = await moduleRepo.findById(data.module_id);
    if (!found) throw new NotFoundError('Modul tidak ditemukan');
    return roadmapRepo.create(data);
  },

  async update(id, data) {
    const updated = await roadmapRepo.update(id, data);
    if (!updated) throw new NotFoundError('Roadmap step tidak ditemukan');
    return roadmapRepo.findById(id);
  },

  async remove(id) {
    const deleted = await roadmapRepo.remove(id);
    if (!deleted) throw new NotFoundError('Roadmap step tidak ditemukan');
  },
};

module.exports = roadmapService;
