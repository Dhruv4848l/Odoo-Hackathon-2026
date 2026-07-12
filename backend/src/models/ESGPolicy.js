const mongoose = require('mongoose');

const ESGPolicySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  version: { type: String, default: '1.0' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  mandatory: { type: Boolean, default: true },
  publishedDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ESGPolicy', ESGPolicySchema);
