const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/score.controller');

router.get('/', scoreController.getDepartmentScores);
router.post('/recalculate', scoreController.recalculateScore);

module.exports = router;
