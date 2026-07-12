const Audit = require('../models/Audit');
const Department = require('../models/Department');
const User = require('../models/User');
const notificationService = require('../services/notifications/notificationService');

// Schedule Audit
exports.scheduleAudit = async (req, res, next) => {
  try {
    const { title, auditorId, departmentId, auditDate } = req.body;

    // Verify department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Verify auditor exists and has Auditor role
    const auditor = await User.findById(auditorId);
    if (!auditor || auditor.role !== 'Auditor') {
      return res.status(400).json({ success: false, message: 'Invalid auditor reference. User must have Auditor role.' });
    }

    const audit = await Audit.create({
      title,
      auditor: auditorId,
      department: departmentId,
      auditDate,
      status: 'Scheduled',
    });

    // Notify auditor of scheduled audit
    await notificationService.notify(auditorId, 'System', {
      message: `You have been scheduled for an audit: "${title}" on department ${dept.name} on ${new Date(auditDate).toLocaleDateString()}.`,
    });

    res.status(201).json({
      success: true,
      message: 'Audit scheduled successfully',
      data: audit,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Audits
exports.getAllAudits = async (req, res, next) => {
  try {
    const { department, status } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;

    const audits = await Audit.find(filter)
      .populate('auditor', 'username email')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      count: audits.length,
      data: audits,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Audit
exports.getAuditById = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id)
      .populate('auditor', 'username email')
      .populate('department', 'name code');
      
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    res.status(200).json({
      success: true,
      data: audit,
    });
  } catch (error) {
    next(error);
  }
};

// Update Audit (Log Findings, Update Score, Upload Evidence)
exports.updateAudit = async (req, res, next) => {
  try {
    const { findings, score, status } = req.body;
    const updateData = {};
    
    if (findings !== undefined) updateData.findings = findings;
    if (score !== undefined) updateData.score = score;
    if (status !== undefined) updateData.status = status;
    
    // Check if evidence file uploaded via Multer
    if (req.file) {
      // Store relative path for URL access: /uploads/filename
      updateData.evidenceUrl = `/uploads/${req.file.filename}`;
    }

    const audit = await Audit.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('department', 'name');

    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    // Trigger score rollup on audit completion
    if (status === 'Completed') {
      try {
        const scoringEngine = require('../services/scoring/scoringEngine');
        await scoringEngine.recalculateDepartmentScore(audit.department._id);
      } catch (err) {
        console.error('[INTEGRATION WARNING] Failed to trigger score rollup:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Audit updated successfully',
      data: audit,
    });
  } catch (error) {
    next(error);
  }
};
