const mongoose = require('mongoose');

const ComplianceIssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Compliance issue title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Compliance issue description is required'],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department reference is required'],
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Mandatory owner (Manager/Admin) is required for compliance issues'],
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required for compliance tracking'],
  },
  status: {
    type: String,
    enum: ['Open', 'InProgress', 'Resolved', 'Overdue'],
    default: 'Open',
  },
  resolvedDate: {
    type: Date,
  },
  evidenceUrl: {
    type: String, // Proof of resolution upload URL (e.g., photo of fixed equipment or signed policy)
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ComplianceIssue', ComplianceIssueSchema);
