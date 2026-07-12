const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Category type is required'],
    enum: ['Emission', 'Social', 'Governance'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound unique key to allow same category name across different types, but unique within a type
CategorySchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
