const express = require('express');
const router = express.Router();
const emissionFactorController = require('../controllers/emissionFactor.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// Public – read emission factors (needed for frontend dropdowns)
router.get('/', protect, emissionFactorController.getEmissionFactors);
router.get('/:id', protect, emissionFactorController.getEmissionFactorById);

// Admin only – manage emission factor library
router.post('/', protect, authorize(['Admin']), emissionFactorController.createEmissionFactor);
router.put('/:id', protect, authorize(['Admin']), emissionFactorController.updateEmissionFactor);
router.delete('/:id', protect, authorize(['Admin']), emissionFactorController.deleteEmissionFactor);

module.exports = router;
