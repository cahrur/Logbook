const config = require('../config');

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message:
      isServerError && config.env === 'production'
        ? 'Internal server error'
        : err.message,
    errors: err.errors || undefined,
  });
}

module.exports = { notFoundHandler, errorHandler };
