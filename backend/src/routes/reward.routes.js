const express = require('express');
const router = express.Router();

// Stub controller placeholder
const controller = {
  getAll: (req, res) => res.json({ success: true, message: 'GET all from reward' }),
  getById: (req, res) => res.json({ success: true, message: 'GET single by id from reward' }),
  create: (req, res) => res.json({ success: true, message: 'CREATE in reward' }),
  update: (req, res) => res.json({ success: true, message: 'UPDATE in reward' }),
  delete: (req, res) => res.json({ success: true, message: 'DELETE in reward' }),
};

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
