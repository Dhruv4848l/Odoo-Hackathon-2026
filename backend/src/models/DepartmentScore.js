const mongoose = require('mongoose');

const DepartmentScoreSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 0 to 11
  environmentalScore: { type: Number, default: 0 },
  socialScore: { type: Number, default: 0 },
  governanceScore: { type: Number, default: 0 },
  combinedScore: { type: Number, default: 0 }, // Combined weight roll-up
}, { timestamps: true });

module.exports = mongoose.model('DepartmentScore', DepartmentScoreSchema);
