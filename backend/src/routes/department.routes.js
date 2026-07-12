const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// Public route to fetch departments (for registration and admin view)
router.get('/', departmentController.getDepartments);

// Admin route to create departments
router.post('/', protect, authorize(['Admin']), departmentController.createDepartment);
router.put('/:id', protect, authorize(['Admin']), departmentController.updateDepartment);
router.delete('/:id', protect, authorize(['Admin']), departmentController.deleteDepartment);

module.exports = router;
