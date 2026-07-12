const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const controller = require('../controllers/reward.controller');

router.use(auth);

router.get('/', controller.getAll);
router.get('/my-redemptions', controller.getMyRedemptions);
router.post('/', role(['Admin']), controller.create);
router.post('/redeem/:id', controller.redeem);

module.exports = router;
