/**
 * General notification dispatcher. (Dev C - Rule 7.7)
 */
exports.notify = async (userId, type, payload) => {
  console.log(`Notifying User ${userId} [${type}]: ${payload.message}`);
  return { success: true };
};
