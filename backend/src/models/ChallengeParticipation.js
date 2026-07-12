const mongoose = require('mongoose');

const ChallengeParticipationSchema = new mongoose.Schema({
  challenge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 }, // percentage
  proof: { type: String }, // URL or file path to uploaded evidence
  approval: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  xp_awarded: { type: Number, default: 0 },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ChallengeParticipation', ChallengeParticipationSchema);
