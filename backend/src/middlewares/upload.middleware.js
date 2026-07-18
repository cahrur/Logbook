const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const config = require('../config');
const { ValidationError } = require('../utils/errors');

// Ensure the upload directory exists.
fs.mkdirSync(config.upload.dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.upload.dir),
  // Always store under a random name with a .pdf extension (no user-supplied path).
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}.pdf`),
});

function fileFilter(req, file, cb) {
  const extOk = path.extname(file.originalname).toLowerCase() === '.pdf';
  const mimeOk = file.mimetype === 'application/pdf';
  if (!extOk || !mimeOk) {
    return cb(new ValidationError('Hanya file PDF yang diperbolehkan'));
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxSizeBytes, files: 1 },
});

// Wrap multer so its errors become proper 400 responses.
function uploadPdf(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Ukuran file melebihi batas maksimal'
            : 'Upload gagal';
        return next(new ValidationError(message));
      }
      return next(err); // ValidationError from fileFilter
    }
    return next();
  });
}

// ----- Image uploads (issue screenshots) -----
const IMAGE_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.upload.dir),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${IMAGE_EXT[file.mimetype] || '.img'}`),
});

function imageFilter(req, file, cb) {
  if (!IMAGE_EXT[file.mimetype]) {
    return cb(new ValidationError('Hanya gambar JPG, PNG, GIF, atau WEBP yang diperbolehkan'));
  }
  return cb(null, true);
}

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: config.upload.maxImageSizeBytes, files: 1 },
});

function uploadImage(req, res, next) {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Ukuran gambar melebihi 2MB'
            : 'Upload gagal';
        return next(new ValidationError(message));
      }
      return next(err);
    }
    return next();
  });
}

module.exports = { uploadPdf, uploadImage };
