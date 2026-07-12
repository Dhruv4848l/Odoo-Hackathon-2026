const mongoose = require('mongoose');

const PolicyAcknowledgementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required for acknowledgement'],
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ESGPolicy',
    required: [true, 'Policy reference is required for acknowledgement'],
  },
  acknowledgedDate: {
    type: Date,
    default: Date.now,
  },
  signature: {
    type: String,
    required: [true, 'Signature (printed name) is required to acknowledge policy'],
    trim: true,
  },
}, {
  timestamps: true,
});

// Ensure a user can only acknowledge a policy once
PolicyAcknowledgementSchema.index({ user: 1, policy: 1 }, { unique: true });

module.exports = mongoose.model('PolicyAcknowledgement', PolicyAcknowledgementSchema);
