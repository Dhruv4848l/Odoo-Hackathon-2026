const mongoose = require('mongoose');

const ChallengeParticipationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  currentProgress: { type: Number, default: 0 },
  status: { type: String, enum: ['Enrolled', 'Completed', 'Failed'], default: 'Enrolled' },
}, { timestamps: true });

module.exports = mongoose.model('ChallengeParticipation', ChallengeParticipationSchema);
