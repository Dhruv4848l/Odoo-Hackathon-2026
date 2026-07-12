const express = require('express');
const router = express.Router();
const complianceIssueController = require('../controllers/complianceIssue.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

// All authenticated users can view compliance lists (e.g. managers tracking dashboard)
router.get('/', auth, complianceIssueController.getAllIssues);
router.get('/:id', auth, complianceIssueController.getIssueById);

// Admin / Auditor / Manager can raise issues and update details
router.post('/', auth, role(['Admin', 'Manager', 'Auditor']), complianceIssueController.createIssue);
router.put('/:id', auth, role(['Admin', 'Manager', 'Auditor']), complianceIssueController.updateIssue);

// Resolve issue with upload evidence support (Managers / Admins / Assigned Owners)
router.put('/:id/resolve', auth, upload.single('evidence'), complianceIssueController.resolveIssue);

module.exports = router;
