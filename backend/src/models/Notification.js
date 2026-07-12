const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification target user reference is required'],
  },
  type: {
    type: String,
    enum: ['Alert', 'Reward', 'Policy', 'System'],
    default: 'System',
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', NotificationSchema);
