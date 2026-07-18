const fs = require('fs');
const { z } = require('zod');
const issueImageService = require('../services/issueImage.service');
const { ok, created, asyncHandler } = require('../utils/response');
const { ValidationError, NotFoundError } = require('../utils/errors');

const listQuerySchema = z.object({ issue_id: z.coerce.number().int().positive() });

module.exports = {
  list: asyncHandler(async (req, res) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError('issue_id tidak valid');
    const data = await issueImageService.listByIssue(parsed.data.issue_id);
    return ok(res, data, 'Daftar gambar');
  }),

  upload: asyncHandler(async (req, res) => {
    if (!req.file) throw new ValidationError('Gambar wajib diunggah');
    const issueId = Number(req.body.issue_id);
    if (!Number.isInteger(issueId) || issueId <= 0) {
      fs.promises.unlink(req.file.path).catch(() => {});
      throw new ValidationError('issue_id tidak valid');
    }
    const data = await issueImageService.create({
      issueId,
      file: req.file,
      userId: Number(req.user.sub),
    });
    return created(res, data, 'Gambar berhasil diunggah');
  }),

  raw: asyncHandler(async (req, res) => {
    const image = await issueImageService.getById(req.params.id);
    const filePath = issueImageService.filePathFor(image);
    if (!fs.existsSync(filePath)) throw new NotFoundError('Gambar tidak ada di server');
    res.setHeader('Content-Type', image.mime_type);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.sendFile(filePath);
  }),

  remove: asyncHandler(async (req, res) => {
    await issueImageService.remove(req.params.id, req.user);
    return ok(res, null, 'Gambar berhasil dihapus');
  }),
};
