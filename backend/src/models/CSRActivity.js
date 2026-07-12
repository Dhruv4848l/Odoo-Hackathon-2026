const mongoose = require('mongoose');

const CSRActivitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  date: { type: Date, required: true },
  xpReward: { type: Number, default: 50 },
  pointsReward: { type: Number, default: 50 },
  maxParticipants: { type: Number },
  status: { type: String, enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' },
}, { timestamps: true });

module.exports = mongoose.model('CSRActivity', CSRActivitySchema);
