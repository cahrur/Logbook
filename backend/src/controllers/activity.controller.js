const activityService = require('../services/activity.service');
const { ok, created, asyncHandler } = require('../utils/response');

module.exports = {
  list: asyncHandler(async (req, res) => {
    const q = req.validated;
    const filters = {
      moduleId: q.module_id,
      category: q.category,
      directiveType: q.directive_type,
      createdBy: q.created_by,
      dateFrom: q.date_from,
      dateTo: q.date_to,
      search: q.search,
      isTask: q.is_task === 'true' ? true : q.is_task === 'false' ? false : undefined,
      taskStatus: q.task_status,
      limit: q.limit,
    };
    const activities = await activityService.list(filters);
    return ok(res, activities, 'Daftar aktivitas');
  }),

  getById: asyncHandler(async (req, res) => {
    const found = await activityService.getById(req.params.id);
    return ok(res, found, 'Detail aktivitas');
  }),

  create: asyncHandler(async (req, res) => {
    const found = await activityService.create(req.validated, req.user);
    return created(res, found, 'Aktivitas berhasil dicatat');
  }),

  update: asyncHandler(async (req, res) => {
    const found = await activityService.update(req.params.id, req.validated, req.user);
    return ok(res, found, 'Aktivitas berhasil diperbarui');
  }),

  remove: asyncHandler(async (req, res) => {
    await activityService.remove(req.params.id, req.user);
    return ok(res, null, 'Aktivitas berhasil dihapus');
  }),
};
