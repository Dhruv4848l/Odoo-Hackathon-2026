const mongoose = require('mongoose');

const EmissionFactorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  factor: { type: Number, required: true }, // kg CO2 per unit
  unit: { type: String, required: true },   // e.g. kWh, km, litre
  source: { type: String },                 // e.g. DEFRA, EPA
}, { timestamps: true });

module.exports = mongoose.model('EmissionFactor', EmissionFactorSchema);
