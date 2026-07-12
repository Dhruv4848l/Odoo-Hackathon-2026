const mongoose = require('mongoose');

const CSRActivitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  date: { type: Date, required: true },
  location: { type: String },
  xpReward: { type: Number, default: 50 },
  pointsReward: { type: Number, default: 50 },
  maxParticipants: { type: Number },
  joinedCount: { type: Number, default: 0 },
  evidenceRequired: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
}, { timestamps: true });

module.exports = mongoose.model('CSRActivity', CSRActivitySchema);
