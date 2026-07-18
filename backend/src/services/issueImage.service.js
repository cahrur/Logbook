const fs = require('fs');
const path = require('path');
const config = require('../config');
const imageRepo = require('../repositories/issueImage.repository');
const issueRepo = require('../repositories/issue.repository');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');

function safePath(storedName) {
  return path.join(config.upload.dir, path.basename(storedName));
}

function removeFromDisk(storedName) {
  fs.promises.unlink(safePath(storedName)).catch(() => {});
}

// Confirm the saved file's magic bytes match a real image.
function detectImageMime(filePath) {
  const fd = fs.openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    const hex = buf.toString('hex').toUpperCase();
    if (hex.startsWith('FFD8FF')) return 'image/jpeg';
    if (hex.startsWith('89504E470D0A1A0A')) return 'image/png';
    if (hex.startsWith('474946383')) return 'image/gif';
    if (buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') {
      return 'image/webp';
    }
    return null;
  } finally {
    fs.closeSync(fd);
  }
}

const issueImageService = {
  listByIssue(issueId) {
    return imageRepo.listByIssue(issueId);
  },

  async getById(id) {
    const image = await imageRepo.findById(id);
    if (!image) throw new NotFoundError('Gambar tidak ditemukan');
    return image;
  },

  filePathFor(image) {
    return safePath(image.stored_name);
  },

  async create({ issueId, file, userId }) {
    const issue = await issueRepo.findById(issueId);
    if (!issue) {
      removeFromDisk(file.filename);
      throw new NotFoundError('Issue tidak ditemukan');
    }

    if (!detectImageMime(safePath(file.filename))) {
      removeFromDisk(file.filename);
      throw new ValidationError('Isi file bukan gambar yang valid');
    }

    return imageRepo.create({
      issue_id: issueId,
      uploaded_by: userId,
      original_name: file.originalname.slice(0, 255),
      stored_name: file.filename,
      mime_type: file.mimetype,
      size_bytes: file.size,
    });
  },

  // Uploader may delete their own image; superadmin may delete any.
  async remove(id, user) {
    const image = await imageRepo.findById(id);
    if (!image) throw new NotFoundError('Gambar tidak ditemukan');
    if (String(image.uploaded_by) !== String(user.sub) && user.role !== 'superadmin') {
      throw new ForbiddenError('Hanya pengunggah atau superadmin yang bisa menghapus');
    }
    await imageRepo.remove(id);
    removeFromDisk(image.stored_name);
  },
};

module.exports = issueImageService;
