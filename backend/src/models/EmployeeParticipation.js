const mongoose = require('mongoose');

const EmployeeParticipationSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CSRActivity', required: true },
  proof: { type: String }, // URL or file path to uploaded evidence
  approval_status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  points_earned: { type: Number, default: 0 },
  completion_date: { type: Date },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmployeeParticipation', EmployeeParticipationSchema);
