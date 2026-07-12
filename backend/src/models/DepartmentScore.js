const mongoose = require('mongoose');

const DepartmentScoreSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 0–11 (JS Date.getMonth())
  environmentalScore: { type: Number, default: 0 },
  socialScore: { type: Number, default: 0 },
  governanceScore: { type: Number, default: 0 },
  combinedScore: { type: Number, default: 0 }, // Weighted roll-up
}, { timestamps: true });

// ✅ Compound unique index: one score record per department per month
DepartmentScoreSchema.index({ department: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('DepartmentScore', DepartmentScoreSchema);
