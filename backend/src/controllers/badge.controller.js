/**
 * Badge Controller (Dev B)
 */
const Badge = require('../models/Badge');
const User = require('../models/User');

// @desc    Get all badges
// @route   GET /api/badges
// @access  Private
exports.getAll = async (req, res, next) => {
  try {
    const badges = await Badge.find().sort({ name: 1 });
    res.json({ success: true, count: badges.length, data: badges });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's earned badges
// @route   GET /api/badges/my-badges
// @access  Private
exports.getMyBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('badges username');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch full badge details for each badge name the user has
    const badges = await Badge.find({ name: { $in: user.badges } });

    res.json({ success: true, count: badges.length, data: badges, userBadgeNames: user.badges });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new badge definition
// @route   POST /api/badges
// @access  Private (Admin only)
exports.create = async (req, res, next) => {
  try {
    const badge = await Badge.create(req.body);
    res.status(201).json({ success: true, data: badge });
  } catch (error) {
    next(error);
  }
};
