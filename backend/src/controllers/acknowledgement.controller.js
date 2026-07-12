const PolicyAcknowledgement = require('../models/PolicyAcknowledgement');
const ESGPolicy = require('../models/ESGPolicy');
const User = require('../models/User');
const Department = require('../models/Department');
const notificationService = require('../services/notifications/notificationService');

// Submit Policy Acknowledgement
exports.acknowledgePolicy = async (req, res, next) => {
  try {
    const { policyId, signature } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate policy exists
    const policy = await ESGPolicy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    // Check if already acknowledged
    const exists = await PolicyAcknowledgement.findOne({ user: userId, policy: policyId });
    if (exists) {
      return res.status(400).json({ success: false, message: 'You have already acknowledged this policy' });
    }

    const acknowledgement = await PolicyAcknowledgement.create({
      user: userId,
      policy: policyId,
      signature,
    });

    // Notify employee of successful acknowledgement
    await notificationService.notify(userId, 'Policy', {
      message: `You have successfully signed the policy: "${policy.title}".`,
    });

    // Optional: Call score rollup trigger here (Stubbed by Dev D)
    try {
      const scoringEngine = require('../services/scoring/scoringEngine');
      const userDoc = await User.findById(userId);
      if (userDoc && userDoc.department) {
        await scoringEngine.recalculateDepartmentScore(userDoc.department);
      }
    } catch (err) {
      console.error('[INTEGRATION WARNING] Failed to trigger score recalculation:', err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Policy acknowledged successfully',
      data: acknowledgement,
    });
  } catch (error) {
    next(error);
  }
};

// Get all acknowledgements for a policy (compliance logs)
exports.getAcknowledgementsForPolicy = async (req, res, next) => {
  try {
    const { policyId } = req.params;

    // Guard: if policyId is a special string or not a valid ObjectId, return all
    const mongoose = require('mongoose');
    const query = (policyId && policyId !== 'all-user' && mongoose.Types.ObjectId.isValid(policyId))
      ? { policy: policyId }
      : {};

    const acknowledgements = await PolicyAcknowledgement.find(query)
      .populate('user', 'username email role department')
      .populate('policy', 'title version');

    res.status(200).json({
      success: true,
      count: acknowledgements.length,
      data: acknowledgements,
    });
  } catch (error) {
    next(error);
  }
};

// Get acknowledgement percentages by department for a policy
exports.getAcknowledgementRate = async (req, res, next) => {
  try {
    const { policyId } = req.params;

    // Verify policy exists
    const policy = await ESGPolicy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const departments = await Department.find({});
    const rateReports = [];

    // Calculate rates per department
    for (const dept of departments) {
      // Count total employees in this department
      const totalEmployees = await User.countDocuments({ department: dept._id });
      
      // Count how many have acknowledged the policy
      const acknowledgements = await PolicyAcknowledgement.find({ policy: policyId })
        .populate({
          path: 'user',
          match: { department: dept._id }
        });
        
      const acknowledgedCount = acknowledgements.filter(ack => ack.user !== null).length;
      const rate = totalEmployees > 0 ? (acknowledgedCount / totalEmployees) * 100 : 0;

      rateReports.push({
        departmentId: dept._id,
        departmentName: dept.name,
        departmentCode: dept.code,
        totalEmployees,
        acknowledgedCount,
        percentage: Math.round(rate * 10) / 10, // round to 1 decimal place
      });
    }

    // Calculate total organizational rate
    const orgTotalEmployees = await User.countDocuments({ role: { $ne: 'Admin' } }); // exclude admins usually
    const orgTotalAcknowledged = await PolicyAcknowledgement.countDocuments({ policy: policyId });
    const orgRate = orgTotalEmployees > 0 ? (orgTotalAcknowledged / orgTotalEmployees) * 100 : 0;

    res.status(200).json({
      success: true,
      policy: {
        title: policy.title,
        version: policy.version,
        mandatory: policy.mandatory,
      },
      overall: {
        totalEmployees: orgTotalEmployees,
        acknowledgedCount: orgTotalAcknowledged,
        percentage: Math.round(orgRate * 10) / 10,
      },
      departments: rateReports,
    });
  } catch (error) {
    next(error);
  }
};
