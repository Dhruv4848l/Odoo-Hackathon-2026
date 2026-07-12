const ComplianceIssue = require('../models/ComplianceIssue');
const Department = require('../models/Department');
const User = require('../models/User');
const notificationService = require('../services/notifications/notificationService');

// Create Compliance Issue (Raised during audits or general operations)
exports.createIssue = async (req, res, next) => {
  try {
    const { title, description, departmentId, severity, ownerId, dueDate } = req.body;

    // Verify department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Verify owner exists (should be manager or admin)
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Assigned owner user not found' });
    }

    const issue = await ComplianceIssue.create({
      title,
      description,
      department: departmentId,
      severity,
      owner: ownerId,
      dueDate,
      status: 'Open',
    });

    // Notify the assigned owner
    await notificationService.notify(ownerId, 'Alert', {
      message: `A new Compliance Issue has been raised and assigned to you: "${title}". Due date: ${new Date(dueDate).toLocaleDateString()}`,
    });

    res.status(201).json({
      success: true,
      message: 'Compliance issue created successfully',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Issues
exports.getAllIssues = async (req, res, next) => {
  try {
    const { department, severity, owner, status } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (severity) filter.severity = severity;
    if (owner) filter.owner = owner;
    if (status) filter.status = status;

    const issues = await ComplianceIssue.find(filter)
      .populate('department', 'name code')
      .populate('owner', 'username email');

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Issue
exports.getIssueById = async (req, res, next) => {
  try {
    const issue = await ComplianceIssue.findById(req.params.id)
      .populate('department', 'name code')
      .populate('owner', 'username email');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Compliance issue not found' });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// Update Issue (Assign owner, modify severity/due date)
exports.updateIssue = async (req, res, next) => {
  try {
    const { title, description, severity, ownerId, dueDate, status } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (severity) updateData.severity = severity;
    if (dueDate) updateData.dueDate = dueDate;
    if (status) updateData.status = status;
    
    if (ownerId) {
      const owner = await User.findById(ownerId);
      if (!owner) {
        return res.status(404).json({ success: false, message: 'Assigned owner not found' });
      }
      updateData.owner = ownerId;
    }

    const issue = await ComplianceIssue.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('owner', 'username');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Compliance issue not found' });
    }

    // If owner was changed, send alert to new owner
    if (ownerId) {
      await notificationService.notify(ownerId, 'Alert', {
        message: `Compliance Issue "${issue.title}" has been reassigned to you.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Compliance issue updated successfully',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// Resolve Compliance Issue (With optional evidence file upload)
exports.resolveIssue = async (req, res, next) => {
  try {
    const updateData = {
      status: 'Resolved',
      resolvedDate: new Date(),
    };

    if (req.file) {
      updateData.evidenceUrl = `/uploads/${req.file.filename}`;
    }

    const issue = await ComplianceIssue.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Compliance issue not found' });
    }

    // Trigger score rollup on issue resolution
    try {
      const scoringEngine = require('../services/scoring/scoringEngine');
      const updatedScore = await scoringEngine.recalculateDepartmentScore(issue.department);
      if (req.io) {
        req.io.emit('SCORE_UPDATED', { department: issue.department, score: updatedScore });
      }
    } catch (err) {
      console.error('[INTEGRATION WARNING] Failed to trigger score rollup:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Compliance issue resolved successfully',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};
