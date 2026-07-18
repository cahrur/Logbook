const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', auth, dashboardController.overview);

module.exports = router;
