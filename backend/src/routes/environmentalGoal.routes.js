const express = require('express');
const router = express.Router();
const environmentalGoalController = require('../controllers/environmentalGoal.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// All routes require authentication
router.get('/', protect, environmentalGoalController.getEnvironmentalGoals);
router.get('/:id', protect, environmentalGoalController.getEnvironmentalGoalById);

// Admin and Manager can create and update goals
router.post('/', protect, authorize(['Admin', 'Manager']), environmentalGoalController.createEnvironmentalGoal);
router.put('/:id', protect, authorize(['Admin', 'Manager']), environmentalGoalController.updateEnvironmentalGoal);

// Only Admin can delete
router.delete('/:id', protect, authorize(['Admin']), environmentalGoalController.deleteEnvironmentalGoal);

module.exports = router;
