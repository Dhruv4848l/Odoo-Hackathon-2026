const express = require('express');
const router = express.Router();

// Stub controller placeholder
const controller = {
  getAll: (req, res) => res.json({ success: true, message: 'GET all from leaderboard' }),
  getById: (req, res) => res.json({ success: true, message: 'GET single by id from leaderboard' }),
  create: (req, res) => res.json({ success: true, message: 'CREATE in leaderboard' }),
  update: (req, res) => res.json({ success: true, message: 'UPDATE in leaderboard' }),
  delete: (req, res) => res.json({ success: true, message: 'DELETE in leaderboard' }),
};

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
