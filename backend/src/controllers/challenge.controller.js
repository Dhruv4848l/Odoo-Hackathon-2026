/**
 * Challenge Controller (Dev B)
 * Full lifecycle: Draft → Active → Under Review → Completed / Archived
 */
const Challenge = require('../models/Challenge');
const ChallengeParticipation = require('../models/ChallengeParticipation');
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

// Valid status transitions
const VALID_TRANSITIONS = {
  Draft: ['Active', 'Archived'],
  Active: ['Under Review', 'Archived'],
  'Under Review': ['Completed', 'Active', 'Archived'],
  Completed: ['Archived'],
  Archived: [],
};

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
exports.getAll = async (req, res, next) => {
  try {
    const { status, difficulty } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;

    const challenges = await Challenge.find(filter)
      .populate('category_id', 'name')
      .populate('created_by', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: challenges.length, data: challenges });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single challenge
// @route   GET /api/challenges/:id
// @access  Private
exports.getById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('category_id', 'name')
      .populate('created_by', 'username');

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a challenge (Draft)
// @route   POST /api/challenges
// @access  Private (Manager/Admin)
exports.create = async (req, res, next) => {
  try {
    const challenge = await Challenge.create({
      ...req.body,
      created_by: req.user.id,
      status: 'Draft',
    });

    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a challenge (only in Draft)
// @route   PUT /api/challenges/:id
// @access  Private (Manager/Admin)
exports.update = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if (challenge.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Only Draft challenges can be edited' });
    }

    const updated = await Challenge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Change challenge status (lifecycle transition)
// @route   POST /api/challenges/:id/status
// @access  Private (Manager/Admin)
exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const allowed = VALID_TRANSITIONS[challenge.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition: ${challenge.status} → ${status}. Allowed: ${allowed.join(', ')}`,
      });
    }

    challenge.status = status;
    await challenge.save();

    res.json({ success: true, data: challenge });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee joins / starts a challenge
// @route   POST /api/challenges/:id/join
// @access  Private (Employee)
exports.join = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if (challenge.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Challenge is not active' });
    }

    const existing = await ChallengeParticipation.findOne({
      challenge_id: challenge._id,
      employee_id: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already joined this challenge' });
    }

    const participation = await ChallengeParticipation.create({
      challenge_id: challenge._id,
      employee_id: req.user.id,
      progress: 0,
      approval: 'Pending',
    });

    res.status(201).json({ success: true, data: participation });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee submits proof for challenge completion
// @route   POST /api/challenges/:id/submit
// @access  Private (Employee)
exports.submitProof = async (req, res, next) => {
  try {
    const participation = await ChallengeParticipation.findOne({
      challenge_id: req.params.id,
      employee_id: req.user.id,
    });

    if (!participation) {
      return res.status(404).json({ success: false, message: 'You have not joined this challenge' });
    }

    const proofPath = req.file ? `/uploads/${req.file.filename}` : req.body.proof;
    if (!proofPath) {
      return res.status(400).json({ success: false, message: 'No proof file provided' });
    }

    participation.proof = proofPath;
    participation.progress = req.body.progress ?? 100;
    participation.approval = 'Pending';
    await participation.save();

    res.json({ success: true, data: participation });
  } catch (error) {
    next(error);
  }
};

// @desc    Manager reviews and approves/rejects challenge submission
// @route   POST /api/challenges/:id/review
// @access  Private (Manager/Admin)
exports.review = async (req, res, next) => {
  try {
    const { employee_id, decision } = req.body;

    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'decision must be "Approved" or "Rejected"' });
    }

    const participation = await ChallengeParticipation.findOne({
      challenge_id: req.params.id,
      employee_id,
    }).populate('challenge_id', 'title xp');

    if (!participation) {
      return res.status(404).json({ success: false, message: 'Participation record not found' });
    }

    participation.approval = decision;
    participation.reviewed_by = req.user.id;

    if (decision === 'Approved') {
      const xpAmount = participation.challenge_id?.xp || 100;
      participation.xp_awarded = xpAmount;

      // Award XP (triggers badge engine internally)
      await awardXP(employee_id, xpAmount, `Challenge completed: ${participation.challenge_id?.title}`);

      await notify(
        employee_id,
        'challenge_approved',
        `🎉 Challenge "${participation.challenge_id?.title}" approved! +${xpAmount} XP awarded.`
      );
    } else {
      await notify(
        employee_id,
        'challenge_rejected',
        `❌ Challenge submission was not approved.`
      );
    }

    await participation.save();

    res.json({ success: true, data: participation });
  } catch (error) {
    next(error);
  }
};
