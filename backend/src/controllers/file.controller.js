const fs = require('fs');
const fileService = require('../services/file.service');
const { ok, created, asyncHandler } = require('../utils/response');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { isPreviewable } = require('../utils/fileTypes');

module.exports = {
  list: asyncHandler(async (req, res) => {
    const data = await fileService.listByModule(req.validated.module_id);
    return ok(res, data, 'Daftar berkas');
  }),

  upload: asyncHandler(async (req, res) => {
    if (!req.file) throw new ValidationError('Berkas wajib diunggah');
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

  // Streams the file for preview/download. Auth is enforced by the route.
  raw: asyncHandler(async (req, res) => {
    const file = await fileService.getById(req.params.id);
    const filePath = fileService.filePathFor(file);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('Berkas tidak ada di server');
    }
    // Preview raster/PDF inline; force download for the rest (and never let the
    // browser sniff the type — e.g. an SVG must not run as an active document).
    const disposition = isPreviewable(file.mime_type) ? 'inline' : 'attachment';
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(file.original_name)}"`
    );
    return res.sendFile(filePath);
  }),

  remove: asyncHandler(async (req, res) => {
    await fileService.remove(req.params.id);
    return ok(res, null, 'Berkas berhasil dihapus');
  }),
};
