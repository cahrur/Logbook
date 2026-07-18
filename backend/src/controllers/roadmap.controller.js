const roadmapService = require('../services/roadmap.service');
const { ok, created, asyncHandler } = require('../utils/response');

module.exports = {
  list: asyncHandler(async (req, res) => {
    const data = await roadmapService.listByModule(req.validated.module_id);
    return ok(res, data, 'Daftar roadmap');
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await roadmapService.getById(req.params.id);
    return ok(res, data, 'Detail roadmap step');
  }),

  create: asyncHandler(async (req, res) => {
    const data = await roadmapService.create(req.validated);
    return created(res, data, 'Roadmap step berhasil dibuat');
  }),

  update: asyncHandler(async (req, res) => {
    const data = await roadmapService.update(req.params.id, req.validated);
    return ok(res, data, 'Roadmap step berhasil diperbarui');
  }),

  remove: asyncHandler(async (req, res) => {
    await roadmapService.remove(req.params.id);
    return ok(res, null, 'Roadmap step berhasil dihapus');
  }),
};
