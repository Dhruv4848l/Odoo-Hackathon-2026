const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  // JSON unlock rule: { type: 'xp', value: 1000 } or { type: 'csr_count', value: 5 }
  unlock_rule: {
    type: { type: String, enum: ['xp', 'csr_count', 'challenge_count', 'points'], required: true },
    value: { type: Number, required: true },
  },
  icon: { type: String }, // URL or filename
}, { timestamps: true });

module.exports = mongoose.model('Badge', BadgeSchema);
