function ok(res, data, message = 'OK', status = 200, extra = {}) {
  return res.status(status).json({ success: true, message, data, ...extra });
}

function created(res, data, message = 'Created successfully') {
  return ok(res, data, message, 201);
}

// Wrap async route handlers so thrown errors reach the global error middleware.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { ok, created, asyncHandler };
