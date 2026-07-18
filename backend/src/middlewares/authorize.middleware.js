const { ForbiddenError } = require('../utils/errors');

// Usage: authorize('admin', 'member')
module.exports = function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Kamu tidak punya akses untuk aksi ini'));
    }
    return next();
  };
};
