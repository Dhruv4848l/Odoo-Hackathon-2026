const mongoose = require('mongoose');

const PolicyAcknowledgementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'ESGPolicy', required: true },
  acknowledgedDate: { type: Date, default: Date.now },
  signature: { type: String }, // digital signature log
}, { timestamps: true });

module.exports = mongoose.model('PolicyAcknowledgement', PolicyAcknowledgementSchema);
