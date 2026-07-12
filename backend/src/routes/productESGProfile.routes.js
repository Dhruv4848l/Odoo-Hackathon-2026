const express = require('express');
const router = express.Router();
const productESGProfileController = require('../controllers/productESGProfile.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// All routes require authentication
router.get('/', protect, productESGProfileController.getProductESGProfiles);
router.get('/:id', protect, productESGProfileController.getProductESGProfileById);

// Admin and Manager can create and update profiles
router.post('/', protect, authorize(['Admin', 'Manager']), productESGProfileController.createProductESGProfile);
router.put('/:id', protect, authorize(['Admin', 'Manager']), productESGProfileController.updateProductESGProfile);

// Only Admin can delete
router.delete('/:id', protect, authorize(['Admin']), productESGProfileController.deleteProductESGProfile);

module.exports = router;
