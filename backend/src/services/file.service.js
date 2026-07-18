const fs = require('fs');
const path = require('path');
const config = require('../config');
const fileRepo = require('../repositories/file.repository');
const moduleRepo = require('../repositories/module.repository');
const { NotFoundError } = require('../utils/errors');
const { assertDocumentContent, extFor } = require('../utils/fileTypes');

function safePath(storedName) {
  // stored_name is a generated UUID.ext, but guard against traversal anyway.
  return path.join(config.upload.dir, path.basename(storedName));
}

function removeFromDisk(storedName) {
  const filePath = safePath(storedName);
  fs.promises.unlink(filePath).catch(() => {});
}

const fileService = {
  listByModule(moduleId) {
    return fileRepo.listByModule(moduleId);
  },

  async getById(id) {
    const file = await fileRepo.findById(id);
    if (!file) throw new NotFoundError('Berkas tidak ditemukan');
    return file;
  },

  filePathFor(file) {
    return safePath(file.stored_name);
  },

  async create({ moduleId, file, userId }) {
    const found = await moduleRepo.findById(moduleId);
    if (!found) {
      removeFromDisk(file.filename);
      throw new NotFoundError('Modul tidak ditemukan');
    }

    // Content sniffing (defense-in-depth beyond extension + MIME).
    // Validate against the stored (whitelisted) extension, not the client name.
    try {
      assertDocumentContent(safePath(file.filename), extFor(file.filename));
    } catch (err) {
      removeFromDisk(file.filename);
      throw err;
    }

    return fileRepo.create({
      module_id: moduleId,
      uploaded_by: userId,
      original_name: file.originalname.slice(0, 255),
      stored_name: file.filename,
      mime_type: file.mimetype,
      size_bytes: file.size,
    });
  },

  async remove(id) {
    const file = await fileRepo.findById(id);
    if (!file) throw new NotFoundError('Berkas tidak ditemukan');
    await fileRepo.remove(id);
    removeFromDisk(file.stored_name);
  },
};

module.exports = fileService;
