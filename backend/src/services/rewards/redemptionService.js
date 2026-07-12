/**
 * Redemption Service — Business Rule 7.4 (Dev B)
 * Handles reward redemption: validates points balance & stock,
 * deducts points, decrements stock, creates a RewardRedemption record,
 * and fires a notification.
 */

const User = require('../../models/User');
const Reward = require('../../models/Reward');
const RewardRedemption = require('../../models/RewardRedemption');

// Stub for notification service (Dev C owns implementation)
const notify = async (userId, type, message) => {
  try {
    const notificationService = require('../notifications/notificationService');
    await notificationService.notify(userId, type, message);
  } catch {
    console.log(`[NOTIFY STUB] userId=${userId} type=${type} msg=${message}`);
  }
};

/**
 * Redeem a reward for a user.
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} rewardId - MongoDB ObjectId of the reward
 * @returns {Promise<RewardRedemption>} The created redemption record
 */
exports.redeemReward = async (userId, rewardId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const reward = await Reward.findById(rewardId);
  if (!reward) throw new Error('Reward not found');
  if (reward.status !== 'Active') throw new Error('Reward is not currently available');

  // Validate stock
  if (reward.stock <= 0) {
    throw new Error('Reward is out of stock');
  }

  // Validate user has enough points
  if (user.points < reward.points_required) {
    throw new Error(`Insufficient points. You have ${user.points} but need ${reward.points_required}`);
  }

  // Deduct points from user
  user.points -= reward.points_required;
  await user.save();

  // Decrement stock on reward
  reward.stock -= 1;
  await reward.save();

  // Create redemption record
  const redemption = await RewardRedemption.create({
    employee_id: userId,
    reward_id: rewardId,
    points_spent: reward.points_required,
    redeemed_date: new Date(),
    status: 'Pending',
  });

  // Notify user
  await notify(
    userId,
    'reward_redemption',
    `🎁 Redemption request submitted for "${reward.name}". ${reward.points_required} points deducted.`
  );

  console.log(`[REDEMPTION] User ${userId} redeemed reward "${reward.name}" (${reward.points_required} pts)`);

  return redemption;
};
