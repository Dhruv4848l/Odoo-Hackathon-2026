const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const controller = require('../controllers/csrActivity.controller');

// All routes require authentication
router.use(auth);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', role(['Admin', 'Manager']), controller.create);
router.put('/:id', role(['Admin', 'Manager']), controller.update);
router.delete('/:id', role(['Admin', 'Manager']), controller.remove);

module.exports = router;
