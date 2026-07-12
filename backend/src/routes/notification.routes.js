const express = require('express');
const router = express.Router();

// Stub controller placeholder
const controller = {
  getAll: (req, res) => res.json({ success: true, message: 'GET all from notification' }),
  getById: (req, res) => res.json({ success: true, message: 'GET single by id from notification' }),
  create: (req, res) => res.json({ success: true, message: 'CREATE in notification' }),
  update: (req, res) => res.json({ success: true, message: 'UPDATE in notification' }),
  delete: (req, res) => res.json({ success: true, message: 'DELETE in notification' }),
};

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
