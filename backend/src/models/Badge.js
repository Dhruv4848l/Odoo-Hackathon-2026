const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true }, // e.g., 'CARBON_SAVER'
  description: { type: String, required: true },
  iconUrl: { type: String },
  criteria: { type: String }, // text description of auto-award criteria
}, { timestamps: true });

module.exports = mongoose.model('Badge', BadgeSchema);
