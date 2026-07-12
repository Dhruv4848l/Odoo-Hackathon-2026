const express = require('express');
const router = express.Router();

// Stub controller placeholder
const controller = {
  getAll: (req, res) => res.json({ success: true, message: 'GET all from acknowledgement' }),
  getById: (req, res) => res.json({ success: true, message: 'GET single by id from acknowledgement' }),
  create: (req, res) => res.json({ success: true, message: 'CREATE in acknowledgement' }),
  update: (req, res) => res.json({ success: true, message: 'UPDATE in acknowledgement' }),
  delete: (req, res) => res.json({ success: true, message: 'DELETE in acknowledgement' }),
};

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
