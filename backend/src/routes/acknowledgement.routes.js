const express = require('express');
const router = express.Router();
const acknowledgementController = require('../controllers/acknowledgement.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// Employees sign off route
router.post('/', auth, acknowledgementController.acknowledgePolicy);

// Get current user's signed policy list (accessible to all authenticated users)
router.get('/my-acknowledgements', auth, acknowledgementController.getMyAcknowledgements);

// Compliance audit / management reports routes
router.get('/policy/:policyId', auth, role(['Admin', 'Manager', 'Auditor']), acknowledgementController.getAcknowledgementsForPolicy);
router.get('/rate/:policyId', auth, role(['Admin', 'Manager', 'Auditor']), acknowledgementController.getAcknowledgementRate);

module.exports = router;
