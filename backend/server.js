const config = require('./src/config');
const app = require('./src/app');
const { runMigrations } = require('./src/config/database');
const authService = require('./src/services/auth.service');

async function start() {
  // Safe, idempotent auto-migration on startup.
  await runMigrations();
  // Seed the initial admin if the users table is empty.
  await authService.ensureAdminUser();

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} (${config.env})`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
