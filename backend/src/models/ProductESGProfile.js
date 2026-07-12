const mongoose = require('mongoose');

const ProductESGProfileSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true },
  carbonFootprint: { type: Number, required: true }, // total lifecycle CO2
  socialScore: { type: Number, min: 0, max: 100, default: 50 },
  governanceScore: { type: Number, min: 0, max: 100, default: 50 },
}, { timestamps: true });

module.exports = mongoose.model('ProductESGProfile', ProductESGProfileSchema);
