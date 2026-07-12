const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Individual', 'Departmental'], default: 'Individual' },
  metric: { type: String, required: true }, // e.g. "XP Earned", "Carbon Reduced"
  targetValue: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  xpReward: { type: Number, default: 100 },
  badgeReward: { type: String }, // Code of badge to award
}, { timestamps: true });

module.exports = mongoose.model('Challenge', ChallengeSchema);
