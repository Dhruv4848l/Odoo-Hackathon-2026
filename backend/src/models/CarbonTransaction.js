const mongoose = require('mongoose');

const CarbonTransactionSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emissionFactor: { type: mongoose.Schema.Types.ObjectId, ref: 'EmissionFactor', required: true },
  activityValue: { type: Number, required: true }, // e.g. 100 kWh
  carbonEmitted: { type: Number, required: true }, // Calculated: activityValue * factor
  transactionDate: { type: Date, default: Date.now },
  description: { type: String },
  evidenceUrl: { type: String }, // link to receipt/invoice upload
}, { timestamps: true });

module.exports = mongoose.model('CarbonTransaction', CarbonTransactionSchema);
