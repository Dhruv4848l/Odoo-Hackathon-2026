const express = require('express');
const router = express.Router();

// Stub controller placeholder
const controller = {
  getAll: (req, res) => res.json({ success: true, message: 'GET all from policy' }),
  getById: (req, res) => res.json({ success: true, message: 'GET single by id from policy' }),
  create: (req, res) => res.json({ success: true, message: 'CREATE in policy' }),
  update: (req, res) => res.json({ success: true, message: 'UPDATE in policy' }),
  delete: (req, res) => res.json({ success: true, message: 'DELETE in policy' }),
};

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
