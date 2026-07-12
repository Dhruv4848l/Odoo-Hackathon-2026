const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');
const env = require('../config/env');
const { validateRefExists } = require('../services/validation/refIntegrity');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRE }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, role, department } = req.body;

    // Validate email & username unique criteria are caught by schema/mongoose,
    // but check department existence explicitly first.
    if (!department) {
      return res.status(400).json({ success: false, message: 'Department is required.' });
    }

    const deptExists = await validateRefExists(Department, department);
    if (!deptExists) {
      return res.status(400).json({ success: false, message: 'Invalid department ID provided.' });
    }

    // Create the user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'Employee',
      department,
    });

    const token = generateToken(user);

    // Fetch user details without password for client response
    const userResponse = await User.findById(user._id).populate('department');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userResponse._id,
        username: userResponse.username,
        email: userResponse.email,
        role: userResponse.role,
        department: userResponse.department,
        xp: userResponse.xp,
        points: userResponse.points,
        badges: userResponse.badges,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Check for user (include password field specifically)
    const user = await User.findOne({ email }).select('+password').populate('department');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        xp: user.xp,
        points: user.points,
        badges: user.badges,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed.',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user.id).populate('department');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        xp: user.xp,
        points: user.points,
        badges: user.badges,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user.',
    });
  }
};
