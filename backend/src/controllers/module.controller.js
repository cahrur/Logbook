const moduleService = require('../services/module.service');
const { ok, created, asyncHandler } = require('../utils/response');

module.exports = {
  list: asyncHandler(async (req, res) => {
    const modules = await moduleService.list();
    return ok(res, modules, 'Daftar modul');
  }),

  getById: asyncHandler(async (req, res) => {
    const found = await moduleService.getById(req.params.id);
    return ok(res, found, 'Detail modul');
  }),

  create: asyncHandler(async (req, res) => {
    const found = await moduleService.create(req.validated);
    return created(res, found, 'Modul berhasil dibuat');
  }),

  update: asyncHandler(async (req, res) => {
    const found = await moduleService.update(req.params.id, req.validated);
    return ok(res, found, 'Modul berhasil diperbarui');
  }),

  remove: asyncHandler(async (req, res) => {
    await moduleService.remove(req.params.id);
    return ok(res, null, 'Modul berhasil dihapus');
  }),
};
