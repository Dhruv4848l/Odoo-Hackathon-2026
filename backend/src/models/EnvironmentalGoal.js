const mongoose = require('mongoose');

const EnvironmentalGoalSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  targetValue: { type: Number, required: true },  // e.g. 5000 kg CO2 limit
  currentValue: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Achieved', 'Failed'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('EnvironmentalGoal', EnvironmentalGoalSchema);
