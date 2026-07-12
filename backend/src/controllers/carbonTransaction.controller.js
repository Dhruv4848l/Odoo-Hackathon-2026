const CarbonTransaction = require('../models/CarbonTransaction');
const EmissionFactor = require('../models/EmissionFactor');
const Department = require('../models/Department');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { validateRefExists } = require('../services/validation/refIntegrity');

const { recalculateDepartmentScore: engineRecalculate } = require('../services/scoring/scoringEngine');

const recalculateDepartmentScore = async (departmentId, io) => {
  try {
    const score = await engineRecalculate(departmentId);
    if (io) {
      io.emit('SCORE_UPDATED', { department: departmentId, score });
    }
    console.log(`[SCORE] Recalculated score for department: ${departmentId}`);
  } catch (err) {
    console.error(`[SCORE RECALC ERROR] ${err.message}`);
  }
};

// @desc    Get all carbon transactions
// @route   GET /api/carbon-transactions
// @access  Private
exports.getCarbonTransactions = async (req, res) => {
  try {
    const filter = {};

    // Admin/Manager see all; others only see their own department
    if (req.user.role === 'Employee') {
      filter.department = req.user.department._id || req.user.department;
    }

    // Optional filters
    if (req.query.departmentId) filter.department = req.query.departmentId;
    if (req.query.startDate || req.query.endDate) {
      filter.transactionDate = {};
      if (req.query.startDate) filter.transactionDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.transactionDate.$lte = new Date(req.query.endDate);
    }

    const transactions = await CarbonTransaction.find(filter)
      .populate('user', 'username email role')
      .populate('department', 'name code')
      .populate({ path: 'emissionFactor', populate: { path: 'category', select: 'name type' } })
      .sort({ transactionDate: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single carbon transaction
// @route   GET /api/carbon-transactions/:id
// @access  Private
exports.getCarbonTransactionById = async (req, res) => {
  try {
    const transaction = await CarbonTransaction.findById(req.params.id)
      .populate('user', 'username email role')
      .populate('department', 'name code')
      .populate({ path: 'emissionFactor', populate: { path: 'category', select: 'name type' } });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Carbon transaction not found.' });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new carbon transaction
// @route   POST /api/carbon-transactions
// @access  Private
exports.createCarbonTransaction = async (req, res) => {
  try {
    const { department, emissionFactor, activityValue, carbonEmitted, transactionDate, description, evidenceUrl } = req.body;

    // Required field validation
    if (!department || !emissionFactor || activityValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'department, emissionFactor, and activityValue are required.',
      });
    }

    // Validate department reference
    const deptExists = await validateRefExists(Department, department);
    if (!deptExists) {
      return res.status(400).json({ success: false, message: 'Invalid or non-existent department ID.' });
    }

    // Validate emission factor reference
    const factorExists = await validateRefExists(EmissionFactor, emissionFactor);
    if (!factorExists) {
      return res.status(400).json({ success: false, message: 'Invalid or non-existent emission factor ID.' });
    }

    if (activityValue <= 0) {
      return res.status(400).json({ success: false, message: 'activityValue must be greater than 0.' });
    }

    // Fetch global settings to determine calculation mode
    let settings = await Settings.findOne();
    const autoCalc = settings ? settings.autoEmissionCalc : true;

    let computedCarbon;
    if (autoCalc) {
      // Auto calculation: carbonEmitted = activityValue * factor
      const factorDoc = await EmissionFactor.findById(emissionFactor);
      computedCarbon = activityValue * factorDoc.factor;
    } else {
      // Manual override: use provided carbonEmitted value
      if (carbonEmitted === undefined || carbonEmitted < 0) {
        return res.status(400).json({
          success: false,
          message: 'carbonEmitted is required and must be >= 0 when auto-calculation is disabled.',
        });
      }
      computedCarbon = carbonEmitted;
    }

    const transaction = await CarbonTransaction.create({
      department,
      user: req.user._id,
      emissionFactor,
      activityValue,
      carbonEmitted: computedCarbon,
      transactionDate: transactionDate || new Date(),
      description,
      evidenceUrl,
    });

    const populated = await transaction.populate([
      { path: 'user', select: 'username email role' },
      { path: 'department', select: 'name code' },
      { path: 'emissionFactor', populate: { path: 'category', select: 'name type' } },
    ]);

    // Notify scoring engine
    await recalculateDepartmentScore(department, req.io);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a carbon transaction
// @route   PUT /api/carbon-transactions/:id
// @access  Private
exports.updateCarbonTransaction = async (req, res) => {
  try {
    const existing = await CarbonTransaction.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Carbon transaction not found.' });
    }

    // Only allow the owner or Admin/Manager to edit
    const isOwner = existing.user.toString() === req.user._id.toString();
    const isAdminOrManager = ['Admin', 'Manager'].includes(req.user.role);
    if (!isOwner && !isAdminOrManager) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this record.' });
    }

    const { activityValue, emissionFactor, carbonEmitted, description, evidenceUrl, transactionDate } = req.body;

    // Check evidence requirement if toggle is active
    let settings = await Settings.findOne();
    const requireEvidence = settings ? settings.evidenceRequirement : false;
    if (requireEvidence && !evidenceUrl && !existing.evidenceUrl) {
      return res.status(400).json({
        success: false,
        message: 'Evidence upload (URL or file) is required by organization policy.',
      });
    }

    let computedCarbon = existing.carbonEmitted;
    const factorId = emissionFactor || existing.emissionFactor;
    const newActivityValue = activityValue !== undefined ? activityValue : existing.activityValue;

    const autoCalc = settings ? settings.autoEmissionCalc : true;

    if (autoCalc && (activityValue !== undefined || emissionFactor)) {
      const factorDoc = await EmissionFactor.findById(factorId);
      if (!factorDoc) {
        return res.status(400).json({ success: false, message: 'Invalid emission factor ID.' });
      }
      computedCarbon = newActivityValue * factorDoc.factor;
    } else if (!autoCalc && carbonEmitted !== undefined) {
      computedCarbon = carbonEmitted;
    }

    const updated = await CarbonTransaction.findByIdAndUpdate(
      req.params.id,
      {
        activityValue: newActivityValue,
        emissionFactor: factorId,
        carbonEmitted: computedCarbon,
        description,
        evidenceUrl,
        transactionDate,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'user', select: 'username email role' },
      { path: 'department', select: 'name code' },
      { path: 'emissionFactor', populate: { path: 'category', select: 'name type' } },
    ]);

    // Notify scoring engine
    await recalculateDepartmentScore(updated.department._id || updated.department, req.io);

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a carbon transaction
// @route   DELETE /api/carbon-transactions/:id
// @access  Private/Admin,Manager
exports.deleteCarbonTransaction = async (req, res) => {
  try {
    const transaction = await CarbonTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Carbon transaction not found.' });
    }

    const deptId = transaction.department;
    await transaction.deleteOne();

    // Notify scoring engine of deletion
    await recalculateDepartmentScore(deptId, req.io);

    res.status(200).json({ success: true, message: 'Carbon transaction deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
