const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  costPoints: { type: Number, required: true }, // Points needed to redeem
  stock: { type: Number, default: 10 },
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Reward', RewardSchema);
