const fs = require('fs');
const fileService = require('../services/file.service');
const { ok, created, asyncHandler } = require('../utils/response');
const { ValidationError, NotFoundError } = require('../utils/errors');

module.exports = {
  list: asyncHandler(async (req, res) => {
    const data = await fileService.listByModule(req.validated.module_id);
    return ok(res, data, 'Daftar berkas');
  }),

  upload: asyncHandler(async (req, res) => {
    if (!req.file) throw new ValidationError('File PDF wajib diunggah');
    const moduleId = Number(req.body.module_id);
    if (!Number.isInteger(moduleId) || moduleId <= 0) {
      // Clean up the orphaned upload before rejecting.
      fs.promises.unlink(req.file.path).catch(() => {});
      throw new ValidationError('module_id tidak valid');
    }
    const data = await fileService.create({
      moduleId,
      file: req.file,
      userId: Number(req.user.sub),
    });
    return created(res, data, 'Berkas berhasil diunggah');
  }),

  // Streams the PDF inline for preview. Auth is enforced by the route.
  raw: asyncHandler(async (req, res) => {
    const file = await fileService.getById(req.params.id);
    const filePath = fileService.filePathFor(file);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('Berkas tidak ada di server');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.original_name)}"`
    );
    return res.sendFile(filePath);
  }),

  remove: asyncHandler(async (req, res) => {
    await fileService.remove(req.params.id);
    return ok(res, null, 'Berkas berhasil dihapus');
  }),
};
