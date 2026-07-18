const config = require('../config');
const authService = require('../services/auth.service');
const { ok, created, asyncHandler } = require('../utils/response');
const { ForbiddenError } = require('../utils/errors');

const REFRESH_COOKIE = 'refreshToken';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: 'strict',
    path: config.cookie.path,
    maxAge: 7 * 24 * 60 * 60 * 1000, // aligned with JWT_REFRESH_EXPIRY default (7d)
  };
}

module.exports = {
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.validated;
    const { accessToken, refreshToken, user } = await authService.login(email, password);
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    return ok(res, { accessToken, user }, 'Login berhasil');
  }),

  refresh: asyncHandler(async (req, res) => {
    const oldToken = req.cookies[REFRESH_COOKIE];
    const { accessToken, refreshToken, user } = await authService.refresh(oldToken);
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    return ok(res, { accessToken, user }, 'Token diperbarui');
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.cookies[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, { path: config.cookie.path });
    return ok(res, null, 'Logout berhasil');
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.sub);
    return ok(res, user, 'Profil ditemukan');
  }),

  createUser: asyncHandler(async (req, res) => {
    // Only a superadmin may create another superadmin.
    if (req.validated.role === 'superadmin' && req.user.role !== 'superadmin') {
      throw new ForbiddenError('Hanya superadmin yang bisa membuat superadmin');
    }
    const user = await authService.createUser(req.validated);
    return created(res, user, 'User berhasil dibuat');
  }),

  listUsers: asyncHandler(async (req, res) => {
    const users = await authService.listUsers();
    return ok(res, users, 'Daftar user');
  }),

  listAssignees: asyncHandler(async (req, res) => {
    const users = await authService.listAssignees();
    return ok(res, users, 'Daftar penerima tugas');
  }),
};
