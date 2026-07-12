const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Audit title is required'],
    trim: true,
    minlength: [3, 'Audit title must be at least 3 characters'],
  },
  auditor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Auditor reference is required'],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department reference is required'],
  },
  auditDate: {
    type: Date,
    required: [true, 'Audit date is required'],
  },
  findings: {
    type: String,
    trim: true,
  },
  score: {
    type: Number,
    min: [0, 'Audit score cannot be less than 0'],
    max: [100, 'Audit score cannot exceed 100'],
  },
  status: {
    type: String,
    enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
  evidenceUrl: {
    type: String, // Path to uploaded audit documentation
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Audit', AuditSchema);
