/**
 * Leaderboard Controller (Dev B)
 * Returns org-wide and department-level XP rankings.
 */
const User = require('../models/User');

// @desc    Org-wide XP leaderboard (top 50)
// @route   GET /api/leaderboard
// @access  Private
exports.getOrg = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const users = await User.find({})
      .select('username email xp points badges department role')
      .populate('department', 'name code')
      .sort({ xp: -1 })
      .limit(limit);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      email: user.email,
      department: user.department,
      xp: user.xp,
      points: user.points,
      badgeCount: user.badges?.length || 0,
      role: user.role,
    }));

    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (error) {
    next(error);
  }
};

// @desc    Department-level XP leaderboard
// @route   GET /api/leaderboard/department/:deptId
// @access  Private
exports.getDepartment = async (req, res, next) => {
  try {
    const { deptId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const users = await User.find({ department: deptId })
      .select('username email xp points badges role')
      .sort({ xp: -1 })
      .limit(limit);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      xp: user.xp,
      points: user.points,
      badgeCount: user.badges?.length || 0,
      role: user.role,
    }));

    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (error) {
    next(error);
  }
};
