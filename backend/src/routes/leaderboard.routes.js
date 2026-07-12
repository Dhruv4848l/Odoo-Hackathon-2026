const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/leaderboard.controller');

router.use(auth);

router.get('/', controller.getOrg);
router.get('/department/:deptId', controller.getDepartment);

module.exports = router;
