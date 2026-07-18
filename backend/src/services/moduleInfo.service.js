const infoRepo = require('../repositories/moduleInfo.repository');
const moduleRepo = require('../repositories/module.repository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

function isOwner(info, user) {
  return String(info.created_by) === String(user.sub);
}

const moduleInfoService = {
  async listByModule(moduleId) {
    const found = await moduleRepo.findById(moduleId);
    if (!found) throw new NotFoundError('Modul tidak ditemukan');
    return infoRepo.listByModule(moduleId);
  },

  async create(data, userId) {
    const found = await moduleRepo.findById(data.module_id);
    if (!found) throw new NotFoundError('Modul tidak ditemukan');
    return infoRepo.create({ ...data, created_by: userId });
  },

  // Only the creator may edit their own info.
  async update(id, data, user) {
    const info = await infoRepo.findById(id);
    if (!info) throw new NotFoundError('Informasi tidak ditemukan');
    if (!isOwner(info, user)) {
      throw new ForbiddenError('Hanya pembuat yang bisa mengubah informasi ini');
    }
    await infoRepo.update(id, data);
    return infoRepo.listByModule(info.module_id).then((rows) => rows.find((r) => r.id === Number(id)));
  },

  // Creator may delete their own info; superadmin may delete any (moderation).
  async remove(id, user) {
    const info = await infoRepo.findById(id);
    if (!info) throw new NotFoundError('Informasi tidak ditemukan');
    if (!isOwner(info, user) && user.role !== 'superadmin') {
      throw new ForbiddenError('Hanya pembuat yang bisa menghapus informasi ini');
    }
    await infoRepo.remove(id);
  },
};

module.exports = moduleInfoService;
