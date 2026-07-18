const { z } = require('zod');
const router = require('express').Router();
const fileController = require('../controllers/file.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const { uploadPdf } = require('../middlewares/upload.middleware');

const listQuerySchema = z.object({ module_id: z.coerce.number().int().positive() });

// Read — all authenticated roles.
router.get('/', auth, validate(listQuerySchema, 'query'), fileController.list);
router.get('/:id', auth, fileController.raw);

// Upload — superadmin, admin & member.
router.post('/', auth, authorize('superadmin', 'admin', 'member'), uploadPdf, fileController.upload);
// Delete — superadmin only.
router.delete('/:id', auth, authorize('superadmin'), fileController.remove);

module.exports = router;
