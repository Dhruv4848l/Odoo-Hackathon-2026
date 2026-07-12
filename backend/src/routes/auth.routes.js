const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// Public routes
router.post('/login', authController.login);

// Private routes (Only Admin can register new users)
router.post('/register', protect, authorize(['Admin']), authController.register);
router.get('/me', protect, authController.getMe);

module.exports = router;
