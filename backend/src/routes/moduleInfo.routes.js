const router = require('express').Router();
const infoController = require('../controllers/moduleInfo.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createInfoSchema,
  updateInfoSchema,
  listInfoQuerySchema,
} = require('../validations/moduleInfo.validation');

// Read — all authenticated roles.
router.get('/', auth, validate(listInfoQuerySchema, 'query'), infoController.list);

// Create — any authenticated user may add info.
router.post('/', auth, validate(createInfoSchema), infoController.create);

// Edit/Delete — ownership enforced in the service (creator only; superadmin may delete).
router.put('/:id', auth, validate(updateInfoSchema), infoController.update);
router.delete('/:id', auth, infoController.remove);

module.exports = router;
