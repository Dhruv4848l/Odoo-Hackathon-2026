const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Fetch user from database to ensure they still exist and retrieve latest properties (like role)
    const user = await User.findById(decoded.id).select('-password').populate('department');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or session is invalid.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};
