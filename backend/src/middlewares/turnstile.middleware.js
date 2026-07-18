const config = require('../config');
const { verifyTurnstileToken } = require('../services/turnstile.service');

// Blocks the request unless a valid Turnstile token is provided.
// Skips entirely when no secret is configured (local dev).
function requireTurnstile(expectedAction) {
  return async (req, res, next) => {
    if (!config.turnstile.secretKey) return next();

    const token = req.body.turnstileToken;
    const remoteIp = req.headers['x-forwarded-for'] || req.ip;
    const result = await verifyTurnstileToken({ token, remoteIp, expectedAction });

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: 'Verifikasi keamanan gagal, silakan coba lagi',
        errors: result['error-codes'] || [],
      });
    }
    return next();
  };
}

module.exports = { requireTurnstile };
