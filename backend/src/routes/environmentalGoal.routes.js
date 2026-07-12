const express = require('express');
const router = express.Router();

// Stub controller placeholder
const controller = {
  getAll: (req, res) => res.json({ success: true, message: 'GET all from environmentalGoal' }),
  getById: (req, res) => res.json({ success: true, message: 'GET single by id from environmentalGoal' }),
  create: (req, res) => res.json({ success: true, message: 'CREATE in environmentalGoal' }),
  update: (req, res) => res.json({ success: true, message: 'UPDATE in environmentalGoal' }),
  delete: (req, res) => res.json({ success: true, message: 'DELETE in environmentalGoal' }),
};

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
