const mongoose = require('mongoose');

const RewardRedemptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  redemptionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Delivered', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('RewardRedemption', RewardRedemptionSchema);
