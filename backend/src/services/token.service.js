const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

const J = config.jwt;

function assertConfig() {
  if (!J.accessSecret || !J.refreshSecret) {
    throw new Error('JWT secrets are not configured (JWT_ACCESS_SECRET / JWT_REFRESH_SECRET)');
  }
  if (J.accessSecret === J.refreshSecret) {
    throw new Error('JWT access and refresh secrets must be different');
  }
}

function generateTokens(user) {
  assertConfig();
  const base = { sub: String(user.id), iss: J.issuer, aud: J.audience };

  const accessToken = jwt.sign(
    { ...base, type: 'access', role: user.role, name: user.name },
    J.accessSecret,
    { algorithm: 'HS256', expiresIn: J.accessExpiry }
  );

  const jti = crypto.randomUUID();
  const refreshToken = jwt.sign({ ...base, type: 'refresh', jti }, J.refreshSecret, {
    algorithm: 'HS256',
    expiresIn: J.refreshExpiry,
  });

  const decoded = jwt.decode(refreshToken);
  const refreshExpiresAt = new Date(decoded.exp * 1000);

  return { accessToken, refreshToken, jti, refreshExpiresAt };
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, J.accessSecret, {
    algorithms: ['HS256'],
    issuer: J.issuer,
    audience: J.audience,
  });
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return payload;
}

function verifyRefreshToken(token) {
  const payload = jwt.verify(token, J.refreshSecret, {
    algorithms: ['HS256'],
    issuer: J.issuer,
    audience: J.audience,
  });
  if (payload.type !== 'refresh') throw new Error('Invalid token type');
  return payload;
}

module.exports = { generateTokens, verifyAccessToken, verifyRefreshToken };
