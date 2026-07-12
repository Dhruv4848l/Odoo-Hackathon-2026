const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// Public route to fetch categories
router.get('/', categoryController.getCategories);

// Admin route to create categories
router.post('/', protect, authorize(['Admin']), categoryController.createCategory);
router.put('/:id', protect, authorize(['Admin']), categoryController.updateCategory);
router.delete('/:id', protect, authorize(['Admin']), categoryController.deleteCategory);

module.exports = router;
