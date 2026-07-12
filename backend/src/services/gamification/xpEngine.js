/**
 * XP Engine — Business Rule 7.3 (Dev B)
 * Awards XP to a user, updates their points balance,
 * then triggers badge auto-award check and sends a notification.
 */

const User = require('../../models/User');
const { checkAndAwardBadges } = require('./badgeEngine');

// Stub for notification service (Dev C owns implementation)
const notify = async (userId, type, message) => {
  try {
    const notificationService = require('../notifications/notificationService');
    await notificationService.notify(userId, type, message);
  } catch {
    // Dev C's service may not be implemented yet; fail silently
    console.log(`[NOTIFY STUB] userId=${userId} type=${type} msg=${message}`);
  }
};

/**
 * Award XP and points to a user.
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {number} amount - XP amount to award (also added to points)
 * @param {string} reason - Human-readable reason (e.g. 'CSR Activity approved')
 */
exports.awardXP = async (userId, amount, reason) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { xp: amount, points: amount } },
    { new: true }
  );

  if (!user) throw new Error(`User not found: ${userId}`);

  console.log(`[XP ENGINE] +${amount} XP → User ${userId} (${reason}). Total XP: ${user.xp}`);

  // Trigger badge auto-award check after XP change
  await checkAndAwardBadges(userId);

  // Notify the user
  await notify(userId, 'xp_award', `🏅 You earned ${amount} XP for: ${reason}`);

  return { success: true, user };
};
