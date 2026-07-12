const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  envWeight: { type: Number, default: 0.4 }, // Default Env: 40%
  socialWeight: { type: Number, default: 0.3 }, // Default Social: 30%
  govWeight: { type: Number, default: 0.3 }, // Default Gov: 30%
  evidenceRequiredForCSR: { type: Boolean, default: true },
  evidenceRequiredForCompliance: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
