const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const controller = require('../controllers/badge.controller');

router.use(auth);

router.get('/', controller.getAll);
router.get('/my-badges', controller.getMyBadges);
router.post('/', role(['Admin']), controller.create);

module.exports = router;
