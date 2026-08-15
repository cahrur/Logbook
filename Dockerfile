# syntax=docker/dockerfile:1

# ---- Stage 1: build the frontend (Vite) ----
FROM node:20-alpine AS frontend
# Must stay "production": Vite bakes NODE_ENV into the bundle, so building with
# "development" ships React's dev build — which makes StrictMode run effects
# twice and fires two concurrent /auth/refresh calls, losing the rotation race.
# Build tools (vite) are guaranteed by the explicit --include=dev on npm ci below,
# so this no longer needs to be "development" to keep devDependencies installed.
ENV NODE_ENV=production
# Public build-time config baked into the SPA bundle. In Coolify, set this as a
# BUILD-TIME variable with your real Cloudflare site key (empty → testing key).
ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_TURNSTILE_SITE_KEY=${VITE_TURNSTILE_SITE_KEY}
WORKDIR /app/frontend
# Copy manifests first for better layer caching. .npmrc pins peer-dependency
# resolution so `npm ci` here matches how package-lock.json was generated.
COPY frontend/package*.json frontend/.npmrc ./
# Cache npm downloads across builds so packages aren't re-fetched every time.
RUN --mount=type=cache,target=/root/.npm npm ci --include=dev
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: backend runtime that also serves the built SPA ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only (cached unless package files change).
# .npmrc pins peer-dependency resolution to match package-lock.json.
COPY backend/package*.json backend/.npmrc ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Application source.
COPY backend/ ./

# Built frontend is served by Express from ./public (single-resource deploy).
COPY --from=frontend /app/frontend/dist ./public

EXPOSE 8000

# Node-based health check (fetch is global in Node 20) — avoids busybox wget flags.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.APP_PORT||8000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
