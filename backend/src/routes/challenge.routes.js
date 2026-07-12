const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const controller = require('../controllers/challenge.controller');

// Configure multer for proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `challenge-proof-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// All routes require authentication
router.use(auth);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', role(['Admin', 'Manager']), controller.create);
router.put('/:id', role(['Admin', 'Manager']), controller.update);
router.post('/:id/status', role(['Admin', 'Manager']), controller.changeStatus);
router.post('/:id/join', controller.join);
router.post('/:id/submit', upload.single('proof'), controller.submitProof);
router.post('/:id/review', role(['Admin', 'Manager']), controller.review);

module.exports = router;
