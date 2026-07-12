const mongoose = require('mongoose');

const RewardRedemptionSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reward_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  points_spent: { type: Number, required: true },
  redeemed_date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending', 'Fulfilled', 'Cancelled'],
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('RewardRedemption', RewardRedemptionSchema);
