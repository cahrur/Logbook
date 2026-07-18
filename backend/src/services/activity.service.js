const activityRepo = require('../repositories/activity.repository');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

// Members may only mutate their own log entries; admins may touch any.
function assertCanMutate(activity, user) {
  if (user.role === 'admin' || user.role === 'superadmin') return;
  if (String(activity.created_by) !== String(user.sub)) {
    throw new ForbiddenError('Kamu hanya bisa mengubah aktivitas milikmu sendiri');
  }
}

const activityService = {
  list(filters) {
    return activityRepo.list(filters);
  },

  async getById(id) {
    const found = await activityRepo.findById(id);
    if (!found) throw new NotFoundError('Aktivitas tidak ditemukan');
    return found;
  },

  create(data, user) {
    return activityRepo.create({ ...data, created_by: Number(user.sub) });
  },

  async update(id, data, user) {
    const existing = await activityRepo.findRawById(id);
    if (!existing) throw new NotFoundError('Aktivitas tidak ditemukan');
    assertCanMutate(existing, user);
    await activityRepo.update(id, data);
    return activityRepo.findById(id);
  },

  async remove(id, user) {
    const existing = await activityRepo.findRawById(id);
    if (!existing) throw new NotFoundError('Aktivitas tidak ditemukan');
    assertCanMutate(existing, user);
    await activityRepo.remove(id);
  },
};

module.exports = activityService;
