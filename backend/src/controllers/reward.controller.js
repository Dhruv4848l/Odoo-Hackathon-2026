/**
 * Reward Controller (Dev B)
 */
const Reward = require('../models/Reward');
const RewardRedemption = require('../models/RewardRedemption');
const { redeemReward } = require('../services/rewards/redemptionService');

// @desc    Get all active rewards (catalog)
// @route   GET /api/rewards
// @access  Private
exports.getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : { status: 'Active' };

    const rewards = await Reward.find(filter).sort({ points_required: 1 });
    res.json({ success: true, count: rewards.length, data: rewards });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new reward
// @route   POST /api/rewards
// @access  Private (Admin only)
exports.create = async (req, res, next) => {
  try {
    const reward = await Reward.create(req.body);
    res.status(201).json({ success: true, data: reward });
  } catch (error) {
    next(error);
  }
};

// @desc    Redeem a reward (triggers redemptionService engine)
// @route   POST /api/rewards/redeem/:id
// @access  Private (Employee)
exports.redeem = async (req, res, next) => {
  try {
    const redemption = await redeemReward(req.user.id, req.params.id);
    res.status(201).json({ success: true, data: redemption });
  } catch (error) {
    // Business logic errors (insufficient points, out of stock) come as regular Error
    if (error.message.includes('Insufficient') || error.message.includes('out of stock') || error.message.includes('not currently available')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get redemption history for logged-in user
// @route   GET /api/rewards/my-redemptions
// @access  Private
exports.getMyRedemptions = async (req, res, next) => {
  try {
    const redemptions = await RewardRedemption.find({ employee_id: req.user.id })
      .populate('reward_id', 'name points_required imageUrl')
      .sort({ redeemed_date: -1 });

    res.json({ success: true, count: redemptions.length, data: redemptions });
  } catch (error) {
    next(error);
  }
};
