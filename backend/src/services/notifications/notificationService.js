const Notification = require('../../models/Notification');
const { sendToUser } = require('../../sockets/index');

/**
 * General notification dispatcher. Saves to database and pushes via Socket.io.
 * (Dev C - Rule 7.7)
 * 
 * @param {string} userId - Target user ID
 * @param {string} type - Notification type: 'Alert', 'Reward', 'Policy', 'System'
 * @param {object} payload - Message and other metadata
 * @param {string} payload.message - Notification message text
 */
exports.notify = async (userId, type, payload) => {
  try {
    if (!userId || !payload || !payload.message) {
      console.error('[NOTIFICATION SERVICE ERROR] Missing required parameters');
      return { success: false, error: 'Missing parameters' };
    }

    console.log(`[NOTIFICATION SERVICE] Creating notification for User: ${userId} [${type}]: ${payload.message}`);

    // 1. Create and save notification in Database
    const notification = await Notification.create({
      user: userId,
      type: type,
      message: payload.message,
      read: false,
    });

    // 2. Dispatch real-time Socket.io alert (if user online)
    const isOnline = sendToUser(userId, 'notification', {
      _id: notification._id,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    });

    return { success: true, notification, isOnline };
  } catch (error) {
    console.error('[NOTIFICATION SERVICE ERROR] failed to dispatch:', error.message);
    return { success: false, error: error.message };
  }
};
