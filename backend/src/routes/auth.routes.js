const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const { requireTurnstile } = require('../middlewares/turnstile.middleware');
const { loginSchema, createUserSchema } = require('../validations/auth.validation');

router.post('/login', requireTurnstile('login'), validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.me);

// Minimal user list for task assignment — any authenticated role.
router.get('/assignees', auth, authController.listAssignees);

// User management — superadmin & admin.
router.get('/users', auth, authorize('superadmin', 'admin'), authController.listUsers);
router.post(
  '/users',
  auth,
  authorize('superadmin', 'admin'),
  validate(createUserSchema),
  authController.createUser
);

module.exports = router;
