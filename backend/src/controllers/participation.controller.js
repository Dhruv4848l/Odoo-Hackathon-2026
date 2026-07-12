/**
 * Participation Controller — CSR Activity Participation (Dev B)
 */
const EmployeeParticipation = require('../models/EmployeeParticipation');
const CSRActivity = require('../models/CSRActivity');
const { awardXP } = require('../services/gamification/xpEngine');

// Stub for notification (Dev C owns implementation)
const notify = async (userId, type, message) => {
  try {
    const ns = require('../services/notifications/notificationService');
    await ns.notify(userId, type, message);
  } catch {
    console.log(`[NOTIFY STUB] ${type}: ${message}`);
  }
};

// @desc    Employee signs up for a CSR activity
// @route   POST /api/participation/signup
// @access  Private (Employee)
exports.signup = async (req, res, next) => {
  try {
    const { activity_id } = req.body;
    const employee_id = req.user.id;

    // Check activity exists and is scheduled
    const activity = await CSRActivity.findById(activity_id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'CSR Activity not found' });
    }
    if (activity.status !== 'Scheduled') {
      return res.status(400).json({ success: false, message: 'Activity is not open for sign-up' });
    }

    // Check not already signed up
    const existing = await EmployeeParticipation.findOne({ employee_id, activity_id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already signed up for this activity' });
    }

    const participation = await EmployeeParticipation.create({
      employee_id,
      activity_id,
      approval_status: 'Pending',
    });

    res.status(201).json({ success: true, data: participation });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee submits proof for their participation
// @route   POST /api/participation/submit-proof/:id
// @access  Private (Employee)
exports.submitProof = async (req, res, next) => {
  try {
    const participation = await EmployeeParticipation.findById(req.params.id);

    if (!participation) {
      return res.status(404).json({ success: false, message: 'Participation record not found' });
    }

    // Verify ownership
    if (participation.employee_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this record' });
    }

    // Set proof: file upload path or URL from body
    const proofPath = req.file ? `/uploads/${req.file.filename}` : req.body.proof;
    if (!proofPath) {
      return res.status(400).json({ success: false, message: 'No proof file provided' });
    }

    participation.proof = proofPath;
    participation.approval_status = 'Pending';
    await participation.save();

    res.json({ success: true, data: participation });
  } catch (error) {
    next(error);
  }
};

// @desc    Manager approves or rejects participation
// @route   POST /api/participation/approve/:id
// @access  Private (Manager/Admin)
exports.approve = async (req, res, next) => {
  try {
    const { decision, points_earned } = req.body; // decision: 'Approved' | 'Rejected'

    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'decision must be "Approved" or "Rejected"' });
    }

    const participation = await EmployeeParticipation.findById(req.params.id)
      .populate('activity_id', 'title xpReward pointsReward');

    if (!participation) {
      return res.status(404).json({ success: false, message: 'Participation record not found' });
    }

    participation.approval_status = decision;
    participation.approved_by = req.user.id;

    if (decision === 'Approved') {
      const xpAmount = participation.activity_id?.xpReward || 50;
      const pts = points_earned ?? participation.activity_id?.pointsReward ?? 50;

      participation.points_earned = pts;
      participation.completion_date = new Date();

      // Award XP (triggers badge check inside)
      await awardXP(participation.employee_id.toString(), xpAmount, `CSR Activity: ${participation.activity_id?.title}`);

      // Notify employee of approval
      await notify(
        participation.employee_id.toString(),
        'csr_approved',
        `✅ Your CSR activity participation has been approved! +${xpAmount} XP`
      );
    } else {
      // Notify employee of rejection
      await notify(
        participation.employee_id.toString(),
        'csr_rejected',
        `❌ Your CSR activity participation was not approved.`
      );
    }

    await participation.save();

    res.json({ success: true, data: participation });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all participations (with optional filters)
// @route   GET /api/participation
// @access  Private (Manager/Admin sees all; Employee sees own)
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};

    // Employees can only see their own
    if (req.user.role === 'Employee') {
      filter.employee_id = req.user.id;
    } else if (req.query.employee_id) {
      filter.employee_id = req.query.employee_id;
    }

    if (req.query.activity_id) filter.activity_id = req.query.activity_id;
    if (req.query.status) filter.approval_status = req.query.status;

    const participations = await EmployeeParticipation.find(filter)
      .populate('employee_id', 'username email department')
      .populate('activity_id', 'title date status')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: participations.length, data: participations });
  } catch (error) {
    next(error);
  }
};
