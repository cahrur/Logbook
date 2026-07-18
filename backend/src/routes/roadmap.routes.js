const router = require('express').Router();
const roadmapController = require('../controllers/roadmap.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createRoadmapSchema,
  updateRoadmapSchema,
  listRoadmapQuerySchema,
} = require('../validations/roadmap.validation');

// Read — all authenticated roles.
router.get('/', auth, validate(listRoadmapQuerySchema, 'query'), roadmapController.list);
router.get('/:id', auth, roadmapController.getById);

// Write — superadmin, admin & member.
router.post(
  '/',
  auth,
  authorize('superadmin', 'admin', 'member'),
  validate(createRoadmapSchema),
  roadmapController.create
);
router.put(
  '/:id',
  auth,
  authorize('superadmin', 'admin', 'member'),
  validate(updateRoadmapSchema),
  roadmapController.update
);
// Delete — superadmin only.
router.delete('/:id', auth, authorize('superadmin'), roadmapController.remove);

module.exports = router;
