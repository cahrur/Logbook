const bcrypt = require('bcryptjs');
const config = require('../config');
const userRepo = require('../repositories/user.repository');
const refreshRepo = require('../repositories/refreshToken.repository');
const tokenService = require('./token.service');
const {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../utils/errors');

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function issueSession(user) {
  const { accessToken, refreshToken, jti, refreshExpiresAt } =
    tokenService.generateTokens(user);
  await refreshRepo.create({ userId: user.id, jti, expiresAt: refreshExpiresAt });
  return { accessToken, refreshToken, user: toPublicUser(user) };
}

const authService = {
  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    // Compare against a dummy hash when user is missing to reduce timing leaks.
    const hash = user ? user.password_hash : '$2a$12$invalidinvalidinvalidinvalidinv.invalidinvalidinvalidinva';
    const valid = await bcrypt.compare(password, hash);
    if (!user || !valid) {
      throw new UnauthorizedError('Email atau password salah');
    }
    return issueSession(user);
  },

  async refresh(oldRefreshToken) {
    if (!oldRefreshToken) throw new UnauthorizedError('Refresh token tidak ditemukan');

    let payload;
    try {
      payload = tokenService.verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new UnauthorizedError('Refresh token tidak valid');
    }

    const stored = await refreshRepo.findByJti(payload.jti);
    if (!stored) throw new UnauthorizedError('Sesi sudah tidak berlaku');

    // Rotation: invalidate the old token before issuing a new pair.
    await refreshRepo.removeByJti(payload.jti);

    const user = await userRepo.findById(payload.sub);
    if (!user) throw new UnauthorizedError('User tidak ditemukan');

    return issueSession(user);
  },

  async logout(refreshToken) {
    if (!refreshToken) return;
    try {
      const payload = tokenService.verifyRefreshToken(refreshToken);
      await refreshRepo.removeAllForUser(payload.sub);
    } catch {
      // Token already invalid — nothing to revoke.
    }
  },

  async getProfile(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw new NotFoundError('User tidak ditemukan');
    return toPublicUser(user);
  },

  async createUser({ name, email, password, role }) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new ConflictError('Email sudah terdaftar');
    const password_hash = await bcrypt.hash(password, config.bcryptRounds);
    const user = await userRepo.create({ name, email, password_hash, role });
    return toPublicUser(user);
  },

  listUsers() {
    return userRepo.list();
  },

  listAssignees() {
    return userRepo.listBasic();
  },

  // On boot: seed the initial superadmin when empty, and ensure the
  // env-designated owner (ADMIN_EMAIL) is a superadmin.
  async ensureAdminUser() {
    const { email, password, name } = config.admin;
    if (!email || !password) {
      const count = await userRepo.count();
      if (count === 0) {
        console.warn(
          '[auth] No users and ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping owner seed. ' +
            'Set them in .env to create the initial superadmin.'
        );
      }
      return;
    }

    const existing = await userRepo.findByEmail(email);
    if (!existing) {
      const count = await userRepo.count();
      if (count === 0) {
        const password_hash = await bcrypt.hash(password, config.bcryptRounds);
        await userRepo.create({ name, email, password_hash, role: 'superadmin' });
        console.log(`[auth] Initial superadmin created: ${email}`);
      }
      return;
    }

    // Promote the designated owner account to superadmin if it isn't already.
    if (existing.role !== 'superadmin') {
      await userRepo.setRole(existing.id, 'superadmin');
      console.log(`[auth] Promoted ${email} to superadmin`);
    }
  },
};

module.exports = authService;
