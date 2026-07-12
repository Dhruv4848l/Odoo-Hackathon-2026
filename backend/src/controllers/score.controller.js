const DepartmentScore = require('../models/DepartmentScore');
const scoringEngine = require('../services/scoring/scoringEngine');

exports.getDepartmentScores = async (req, res) => {
  try {
    const scores = await DepartmentScore.find().populate('department', 'name');
    res.json({ success: true, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recalculateScore = async (req, res) => {
  try {
    const { departmentId, year, month } = req.body;
    const newScore = await scoringEngine.recalculateDepartmentScore(departmentId, year, month);
    res.json({ success: true, data: newScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
