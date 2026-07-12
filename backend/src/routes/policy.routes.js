const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// Public/General employee routes (requires login)
router.get('/', auth, policyController.getAllPolicies);
router.get('/:id', auth, policyController.getPolicyById);

// Admin/Manager only routes
router.post('/', auth, role(['Admin', 'Manager']), policyController.createPolicy);
router.put('/:id', auth, role(['Admin', 'Manager']), policyController.updatePolicy);
router.delete('/:id', auth, role(['Admin', 'Manager']), policyController.deletePolicy);

module.exports = router;
