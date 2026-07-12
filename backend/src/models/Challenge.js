const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  xp: { type: Number, required: true, default: 100 },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  evidence_required: { type: Boolean, default: true },
  deadline: { type: Date },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Under Review', 'Completed', 'Archived'],
    default: 'Draft',
  },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Challenge', ChallengeSchema);
