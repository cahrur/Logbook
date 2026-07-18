const config = require('../config');

// Verify a Turnstile token against Cloudflare's Siteverify API.
async function verifyTurnstileToken({ token, remoteIp, expectedAction }) {
  if (!token || typeof token !== 'string' || token.length > 2048) {
    return { success: false, 'error-codes': ['invalid-input-response'] };
  }

  try {
    const response = await fetch(config.turnstile.verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: config.turnstile.secretKey,
        response: token,
        remoteip: remoteIp,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      return { success: false, 'error-codes': result['error-codes'] || ['bad-request'] };
    }

    // Enforce action / hostname only when the response provides them (and one is configured).
    if (expectedAction && result.action && result.action !== expectedAction) {
      return { success: false, 'error-codes': ['action-mismatch'] };
    }
    if (config.turnstile.expectedHostname && result.hostname !== config.turnstile.expectedHostname) {
      return { success: false, 'error-codes': ['hostname-mismatch'] };
    }

    return result;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, 'error-codes': ['internal-error'] };
  }
}

module.exports = { verifyTurnstileToken };
