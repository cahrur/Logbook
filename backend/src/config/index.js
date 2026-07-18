const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function splitCsv(value) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.APP_PORT, 10) || 8000,
  corsOrigins: splitCsv(process.env.CORS_ORIGINS),

  db: {
    client: process.env.DB_CLIENT || 'pg',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    issuer: process.env.JWT_ISSUER || 'logbook-auth',
    audience: process.env.JWT_AUDIENCE || 'logbook-client',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 8,

  upload: {
    dir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
    maxSizeBytes: (parseInt(process.env.MAX_UPLOAD_SIZE_MB, 10) || 10) * 1024 * 1024,
    maxImageSizeBytes: (parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 2) * 1024 * 1024,
  },

  turnstile: {
    // Empty secret → verification is skipped (local dev). Set both in production.
    secretKey: process.env.TURNSTILE_SECRET_KEY || '',
    expectedHostname: process.env.TURNSTILE_EXPECTED_HOSTNAME || '',
    verifyUrl: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 10,
  },

  cookie: {
    secure: process.env.NODE_ENV === 'production',
    // refresh token cookie only sent to auth endpoints
    path: '/api/v1/auth',
  },

  // Initial admin, seeded on first boot when no users exist.
  admin: {
    name: process.env.ADMIN_NAME || 'Administrator',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
};

module.exports = config;
