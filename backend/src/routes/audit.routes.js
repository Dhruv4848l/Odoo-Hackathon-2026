const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

// Auditor, Manager, Admin can view audits
router.get('/', auth, role(['Admin', 'Manager', 'Auditor']), auditController.getAllAudits);
router.get('/:id', auth, role(['Admin', 'Manager', 'Auditor']), auditController.getAuditById);

// Schedule audit (Admin/Manager/Auditor)
router.post('/', auth, role(['Admin', 'Manager', 'Auditor']), auditController.scheduleAudit);

// Update audit findings / scores / upload evidence file (Auditors, Admins)
router.put('/:id', auth, role(['Admin', 'Auditor']), upload.single('evidence'), auditController.updateAudit);

module.exports = router;
