const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  auditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User with role Auditor
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  auditDate: { type: Date, required: true },
  findings: { type: String },
  score: { type: Number, min: 0, max: 100 }, // Social or Governance audit score
  status: { type: String, enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled'], default: 'Scheduled' },
}, { timestamps: true });

module.exports = mongoose.model('Audit', AuditSchema);
