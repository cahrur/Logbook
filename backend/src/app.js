const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        // Cloudflare Turnstile (widget) + Cloudflare Web Analytics beacon.
        scriptSrc: [
          "'self'",
          'https://challenges.cloudflare.com',
          'https://static.cloudflareinsights.com',
        ],
        frameSrc: ["'self'", 'https://challenges.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'https://challenges.cloudflare.com',
          'https://cloudflareinsights.com',
        ],
        formAction: ["'self'"],
        upgradeInsecureRequests: config.env === 'production' ? [] : null,
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
  })
);

app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Rate limiting is only enforced in production to keep local dev friction-free.
const skipInDev = () => config.env !== 'production';

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { success: false, message: 'Terlalu banyak permintaan, coba lagi nanti' },
});
// Strict limiter for brute-force-prone endpoints (login/register). NOT applied
// to /refresh, which runs on every app load and is protected by the cookie.
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { success: false, message: 'Terlalu banyak percobaan, coba lagi nanti' },
});

// Health check (before rate limiter so monitors are never throttled).
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'OK', uptime: process.uptime() });
});

app.use('/api/', apiLimiter);
app.use('/api/v1/auth/login', authLimiter);

app.use('/api/v1', routes);

// Unknown API routes → JSON 404.
app.use('/api', notFoundHandler);

// Serve the built frontend (single-resource deployment). In dev the frontend
// runs on its own Vite server, so this block is skipped when public/ is absent.
const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(path.join(publicDir, 'index.html'))) {
  app.use(express.static(publicDir));
  // SPA fallback for any non-API GET route.
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use(errorHandler);

module.exports = app;
