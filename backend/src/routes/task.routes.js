const router = require('express').Router();
const taskController = require('../controllers/task.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createTaskSchema,
  updateTaskSchema,
  listTaskQuerySchema,
} = require('../validations/task.validation');

// Read — all authenticated roles.
router.get('/', auth, validate(listTaskQuerySchema, 'query'), taskController.list);
router.get('/:id', auth, taskController.getById);

// Write — superadmin, admin & member.
router.post(
  '/',
  auth,
  authorize('superadmin', 'admin', 'member'),
  validate(createTaskSchema),
  taskController.create
);
router.put(
  '/:id',
  auth,
  authorize('superadmin', 'admin', 'member'),
  validate(updateTaskSchema),
  taskController.update
);
// Delete — superadmin only.
router.delete('/:id', auth, authorize('superadmin'), taskController.remove);

module.exports = router;
