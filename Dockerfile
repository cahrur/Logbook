# syntax=docker/dockerfile:1

# ---- Stage 1: build the frontend (Vite) ----
FROM node:20-alpine AS frontend
# Force a dev install so build tools (vite) are present even when the platform
# injects NODE_ENV=production at build time (e.g. Coolify).
ENV NODE_ENV=development
WORKDIR /app/frontend
# Copy manifests first for better layer caching.
COPY frontend/package*.json ./
RUN npm ci --include=dev
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: backend runtime that also serves the built SPA ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only (cached unless package files change).
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Application source.
COPY backend/ ./

# Built frontend is served by Express from ./public (single-resource deploy).
COPY --from=frontend /app/frontend/dist ./public

EXPOSE 8000

# Node-based health check (fetch is global in Node 20) — avoids busybox wget flags.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.APP_PORT||8000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
