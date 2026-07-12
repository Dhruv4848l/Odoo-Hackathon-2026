const express = require('express');
const router = express.Router();

// Stub controller placeholder
const controller = {
  getAll: (req, res) => res.json({ success: true, message: 'GET all from department' }),
  getById: (req, res) => res.json({ success: true, message: 'GET single by id from department' }),
  create: (req, res) => res.json({ success: true, message: 'CREATE in department' }),
  update: (req, res) => res.json({ success: true, message: 'UPDATE in department' }),
  delete: (req, res) => res.json({ success: true, message: 'DELETE in department' }),
};

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
