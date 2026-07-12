const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const evidenceCheck = require('../middleware/evidenceRequirement.middleware');
const controller = require('../controllers/participation.controller');

// Configure multer for local disk uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `proof-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// All routes require authentication
router.use(auth);

router.get('/', controller.getAll);
router.post('/signup', controller.signup);
router.post('/submit-proof/:id', upload.single('proof'), controller.submitProof);
router.post(
  '/approve/:id',
  role(['Admin', 'Manager']),
  evidenceCheck('evidenceRequiredForCSR'),
  controller.approve
);

module.exports = router;
