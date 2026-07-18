const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/modules', require('./module.routes'));
router.use('/roadmap', require('./roadmap.routes'));
router.use('/files', require('./file.routes'));
router.use('/tasks', require('./task.routes'));
router.use('/activities', require('./activity.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
