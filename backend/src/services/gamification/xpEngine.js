/**
 * Handles awarding XP to users. (Dev B)
 */
exports.awardXP = async (userId, amount, reason) => {
  console.log(`Awarding ${amount} XP to User ${userId} for: ${reason}`);
  return { success: true };
};
