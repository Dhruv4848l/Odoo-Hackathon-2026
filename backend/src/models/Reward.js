const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  points_required: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  imageUrl: { type: String },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Reward', RewardSchema);
