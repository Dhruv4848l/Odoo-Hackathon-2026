const express = require('express');
const router = express.Router();

// Stub controller placeholder
const controller = {
  getAll: (req, res) => res.json({ success: true, message: 'GET all from carbonTransaction' }),
  getById: (req, res) => res.json({ success: true, message: 'GET single by id from carbonTransaction' }),
  create: (req, res) => res.json({ success: true, message: 'CREATE in carbonTransaction' }),
  update: (req, res) => res.json({ success: true, message: 'UPDATE in carbonTransaction' }),
  delete: (req, res) => res.json({ success: true, message: 'DELETE in carbonTransaction' }),
};

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
