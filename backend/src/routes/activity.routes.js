const router = require('express').Router();
const activityController = require('../controllers/activity.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createActivitySchema,
  updateActivitySchema,
  listActivityQuerySchema,
} = require('../validations/activity.validation');

// Read — all authenticated roles.
router.get('/', auth, validate(listActivityQuerySchema, 'query'), activityController.list);
router.get('/:id', auth, activityController.getById);

// Write — superadmin, admin & member (ownership enforced in service for members).
router.post(
  '/',
  auth,
  authorize('superadmin', 'admin', 'member'),
  validate(createActivitySchema),
  activityController.create
);
router.put(
  '/:id',
  auth,
  authorize('superadmin', 'admin', 'member'),
  validate(updateActivitySchema),
  activityController.update
);
// Delete — superadmin only.
router.delete('/:id', auth, authorize('superadmin'), activityController.remove);

module.exports = router;
