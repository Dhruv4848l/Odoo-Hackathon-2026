const express = require('express');
const router = express.Router();
const carbonTransactionController = require('../controllers/carbonTransaction.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// All routes require authentication
router.get('/', protect, carbonTransactionController.getCarbonTransactions);
router.get('/:id', protect, carbonTransactionController.getCarbonTransactionById);
router.post('/', protect, carbonTransactionController.createCarbonTransaction);
router.put('/:id', protect, carbonTransactionController.updateCarbonTransaction);
router.delete('/:id', protect, authorize(['Admin', 'Manager']), carbonTransactionController.deleteCarbonTransaction);

module.exports = router;
