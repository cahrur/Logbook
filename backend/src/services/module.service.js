const moduleRepo = require('../repositories/module.repository');
const { NotFoundError } = require('../utils/errors');

const moduleService = {
  list() {
    return moduleRepo.list();
  },

  async getById(id) {
    const found = await moduleRepo.findById(id);
    if (!found) throw new NotFoundError('Modul tidak ditemukan');
    return found;
  },

  create(data) {
    return moduleRepo.create(data);
  },

  async update(id, data) {
    const updated = await moduleRepo.update(id, data);
    if (!updated) throw new NotFoundError('Modul tidak ditemukan');
    return moduleRepo.findById(id);
  },

  async remove(id) {
    const deleted = await moduleRepo.remove(id);
    if (!deleted) throw new NotFoundError('Modul tidak ditemukan');
  },
};

module.exports = moduleService;
