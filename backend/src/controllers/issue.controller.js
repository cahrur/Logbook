const issueService = require('../services/issue.service');
const { ok, created, asyncHandler } = require('../utils/response');

module.exports = {
  list: asyncHandler(async (req, res) => {
    const data = await issueService.listByModule(req.validated.module_id);
    return ok(res, data, 'Daftar issue');
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await issueService.getById(req.params.id);
    return ok(res, data, 'Detail issue');
  }),

  create: asyncHandler(async (req, res) => {
    const data = await issueService.create(req.validated, Number(req.user.sub));
    return created(res, data, 'Issue berhasil dibuat');
  }),

  update: asyncHandler(async (req, res) => {
    const data = await issueService.update(req.params.id, req.validated);
    return ok(res, data, 'Issue berhasil diperbarui');
  }),

  remove: asyncHandler(async (req, res) => {
    await issueService.remove(req.params.id);
    return ok(res, null, 'Issue berhasil dihapus');
  }),
};
