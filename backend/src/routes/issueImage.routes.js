const router = require('express').Router();
const controller = require('../controllers/issueImage.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');
const { uploadImage } = require('../middlewares/upload.middleware');

// Read — all authenticated roles.
router.get('/', auth, controller.list);
router.get('/:id', auth, controller.raw);

// Upload — superadmin, admin & member.
router.post('/', auth, authorize('superadmin', 'admin', 'member'), uploadImage, controller.upload);

// Delete — uploader or superadmin (enforced in service).
router.delete('/:id', auth, controller.remove);

module.exports = router;
