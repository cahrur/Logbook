const router = require('express').Router();
const issueController = require('../controllers/issue.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createIssueSchema,
  updateIssueSchema,
  listIssueQuerySchema,
} = require('../validations/issue.validation');

// Read — all authenticated roles.
router.get('/', auth, validate(listIssueQuerySchema, 'query'), issueController.list);
router.get('/:id', auth, issueController.getById);

// Write — superadmin, admin & member.
router.post(
  '/',
  auth,
  authorize('superadmin', 'admin', 'member'),
  validate(createIssueSchema),
  issueController.create
);
router.put(
  '/:id',
  auth,
  authorize('superadmin', 'admin', 'member'),
  validate(updateIssueSchema),
  issueController.update
);
// Delete — superadmin only.
router.delete('/:id', auth, authorize('superadmin'), issueController.remove);

module.exports = router;
