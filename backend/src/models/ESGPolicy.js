const mongoose = require('mongoose');

const ESGPolicySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Policy title is required'],
    trim: true,
    minlength: [3, 'Policy title must be at least 3 characters'],
  },
  content: {
    type: String,
    required: [true, 'Policy content is required'],
  },
  version: {
    type: String,
    default: '1.0',
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Policy category is required'],
  },
  mandatory: {
    type: Boolean,
    default: true,
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ESGPolicy', ESGPolicySchema);
