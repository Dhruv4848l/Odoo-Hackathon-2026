/**
 * Badge Engine — Business Rule 7.3 (Dev B)
 * Evaluates Badge unlock_rule conditions and auto-awards badges to users.
 * Triggered after any XP change or challenge completion.
 */

const User = require('../../models/User');
const Badge = require('../../models/Badge');
const EmployeeParticipation = require('../../models/EmployeeParticipation');
const ChallengeParticipation = require('../../models/ChallengeParticipation');

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
 * Check all badge unlock_rules against a user's current stats and award any earned badges.
 * @param {string} userId - MongoDB ObjectId of the user
 */
exports.checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const allBadges = await Badge.find();
  const userBadgeNames = user.badges || [];
  const newlyAwarded = [];

  for (const badge of allBadges) {
    // Skip if already earned
    if (userBadgeNames.includes(badge.name)) continue;

    const rule = badge.unlock_rule;
    if (!rule) continue;

    let conditionMet = false;

    switch (rule.type) {
      case 'xp':
        conditionMet = user.xp >= rule.value;
        break;

      case 'points':
        conditionMet = user.points >= rule.value;
        break;

      case 'csr_count': {
        const count = await EmployeeParticipation.countDocuments({
          employee_id: userId,
          approval_status: 'Approved',
        });
        conditionMet = count >= rule.value;
        break;
      }

      case 'challenge_count': {
        const count = await ChallengeParticipation.countDocuments({
          employee_id: userId,
          approval: 'Approved',
        });
        conditionMet = count >= rule.value;
        break;
      }

      default:
        break;
    }

    if (conditionMet) {
      user.badges.push(badge.name);
      newlyAwarded.push(badge.name);
      await notify(userId, 'badge_unlock', `🏆 You unlocked a new badge: ${badge.name}!`);
      console.log(`[BADGE ENGINE] Badge "${badge.name}" awarded to User ${userId}`);
    }
  }

  if (newlyAwarded.length > 0) {
    await user.save();
  }

  return newlyAwarded;
};
