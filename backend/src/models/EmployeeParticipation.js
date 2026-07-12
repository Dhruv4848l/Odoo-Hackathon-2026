const mongoose = require('mongoose');

const EmployeeParticipationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'CSRActivity', required: true },
  evidenceUrl: { type: String }, // photo proof
  status: { type: String, enum: ['Registered', 'PendingApproval', 'Approved', 'Rejected'], default: 'Registered' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmployeeParticipation', EmployeeParticipationSchema);
