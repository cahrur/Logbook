const router = require('express').Router();
const moduleController = require('../controllers/module.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createModuleSchema,
  updateModuleSchema,
} = require('../validations/module.validation');

// Read — all authenticated roles (incl. viewer).
router.get('/', auth, moduleController.list);
router.get('/:id', auth, moduleController.getById);

// Write — superadmin, admin & member.
router.post(
  '/',
  auth,
  authorize('superadmin', 'admin', 'member'),
  validate(createModuleSchema),
  moduleController.create
);
router.put(
  '/:id',
  auth,
  authorize('superadmin', 'admin', 'member'),
  validate(updateModuleSchema),
  moduleController.update
);
// Delete — superadmin only.
router.delete('/:id', auth, authorize('superadmin'), moduleController.remove);

module.exports = router;
