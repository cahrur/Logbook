const taskService = require('../services/task.service');
const { ok, created, asyncHandler } = require('../utils/response');

module.exports = {
  list: asyncHandler(async (req, res) => {
    const data = await taskService.list({
      moduleId: req.validated.module_id,
      assigneeId: req.validated.assignee_id,
    });
    return ok(res, data, 'Daftar tugas');
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await taskService.getById(req.params.id);
    return ok(res, data, 'Detail tugas');
  }),

  create: asyncHandler(async (req, res) => {
    const data = await taskService.create(req.validated, Number(req.user.sub));
    return created(res, data, 'Tugas berhasil dibuat');
  }),

  update: asyncHandler(async (req, res) => {
    const data = await taskService.update(req.params.id, req.validated);
    return ok(res, data, 'Tugas berhasil diperbarui');
  }),

  remove: asyncHandler(async (req, res) => {
    await taskService.remove(req.params.id);
    return ok(res, null, 'Tugas berhasil dihapus');
  }),
};
