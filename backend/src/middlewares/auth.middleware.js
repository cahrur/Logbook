const { verifyAccessToken } = require('../services/token.service');
const { UnauthorizedError } = require('../utils/errors');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Token tidak ditemukan'));
  }

  try {
    req.user = verifyAccessToken(token); // { sub, role, name, iss, aud, ... }
    return next();
  } catch {
    return next(new UnauthorizedError('Token tidak valid atau kedaluwarsa'));
  }
};
