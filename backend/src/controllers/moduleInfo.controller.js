const moduleInfoService = require('../services/moduleInfo.service');
const { ok, created, asyncHandler } = require('../utils/response');

module.exports = {
  list: asyncHandler(async (req, res) => {
    const data = await moduleInfoService.listByModule(req.validated.module_id);
    return ok(res, data, 'Daftar informasi');
  }),

  create: asyncHandler(async (req, res) => {
    const data = await moduleInfoService.create(req.validated, Number(req.user.sub));
    return created(res, data, 'Informasi berhasil ditambahkan');
  }),

  update: asyncHandler(async (req, res) => {
    const data = await moduleInfoService.update(req.params.id, req.validated, req.user);
    return ok(res, data, 'Informasi berhasil diperbarui');
  }),

  remove: asyncHandler(async (req, res) => {
    await moduleInfoService.remove(req.params.id, req.user);
    return ok(res, null, 'Informasi berhasil dihapus');
  }),
};
