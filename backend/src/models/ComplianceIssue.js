const mongoose = require('mongoose');

const ComplianceIssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // assigned manager
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Open', 'InProgress', 'Resolved', 'Overdue'], default: 'Open' },
  resolvedDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('ComplianceIssue', ComplianceIssueSchema);
