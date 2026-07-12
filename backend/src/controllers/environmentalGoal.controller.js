const EnvironmentalGoal = require('../models/EnvironmentalGoal');
const CarbonTransaction = require('../models/CarbonTransaction');
const Department = require('../models/Department');
const Category = require('../models/Category');
const { validateRefExists } = require('../services/validation/refIntegrity');

/**
 * Compute the current emission total for a given category and department
 * within the goal's date range by aggregating CarbonTransactions.
 */
const computeGoalAttainment = async (goal) => {
  // Get all emission factors that belong to the goal's category
  const EmissionFactor = require('../models/EmissionFactor');
  const factorsInCategory = await EmissionFactor.find({ category: goal.category }).select('_id');
  const factorIds = factorsInCategory.map((f) => f._id);

  // Sum all carbonEmitted for those factors, within the goal's date range, for that department
  const result = await CarbonTransaction.aggregate([
    {
      $match: {
        department: goal.department,
        emissionFactor: { $in: factorIds },
        transactionDate: { $gte: goal.startDate, $lte: goal.endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalCarbon: { $sum: '$carbonEmitted' },
      },
    },
  ]);

  const currentValue = result.length > 0 ? result[0].totalCarbon : 0;

  // Determine goal status
  let status = 'Active';
  const now = new Date();
  if (currentValue <= goal.targetValue) {
    if (now > goal.endDate) status = 'Achieved';
  } else {
    if (now > goal.endDate) status = 'Failed';
  }

  return { currentValue, status };
};

// @desc    Get all environmental goals
// @route   GET /api/environmental-goals
// @access  Private
exports.getEnvironmentalGoals = async (req, res) => {
  try {
    const filter = {};
    if (req.query.departmentId) filter.department = req.query.departmentId;
    if (req.user.role === 'Employee') {
      filter.department = req.user.department._id || req.user.department;
    }

    const goals = await EnvironmentalGoal.find(filter)
      .populate('department', 'name code')
      .populate('category', 'name type');

    // Enrich each goal with live computed attainment
    const enriched = await Promise.all(
      goals.map(async (goal) => {
        const { currentValue, status } = await computeGoalAttainment(goal);
        return {
          ...goal.toObject(),
          currentValue,
          status,
          progressPercent: goal.targetValue > 0
            ? Math.min(100, Math.round((currentValue / goal.targetValue) * 100))
            : 0,
        };
      })
    );

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single environmental goal
// @route   GET /api/environmental-goals/:id
// @access  Private
exports.getEnvironmentalGoalById = async (req, res) => {
  try {
    const goal = await EnvironmentalGoal.findById(req.params.id)
      .populate('department', 'name code')
      .populate('category', 'name type');

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Environmental goal not found.' });
    }

    const { currentValue, status } = await computeGoalAttainment(goal);
    const progressPercent = goal.targetValue > 0
      ? Math.min(100, Math.round((currentValue / goal.targetValue) * 100))
      : 0;

    res.status(200).json({
      success: true,
      data: { ...goal.toObject(), currentValue, status, progressPercent },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an environmental goal
// @route   POST /api/environmental-goals
// @access  Private/Admin, Manager
exports.createEnvironmentalGoal = async (req, res) => {
  try {
    const { department, category, targetValue, startDate, endDate } = req.body;

    if (!department || !category || targetValue === undefined || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'department, category, targetValue, startDate and endDate are required.',
      });
    }

    // Validate department reference
    const deptExists = await validateRefExists(Department, department);
    if (!deptExists) {
      return res.status(400).json({ success: false, message: 'Invalid or non-existent department ID.' });
    }

    // Validate category reference and type
    const catExists = await validateRefExists(Category, category);
    if (!catExists) {
      return res.status(400).json({ success: false, message: 'Invalid or non-existent category ID.' });
    }

    const categoryDoc = await Category.findById(category);
    if (categoryDoc.type !== 'Emission') {
      return res.status(400).json({
        success: false,
        message: `Environmental goals must reference an "Emission" category. Provided: "${categoryDoc.type}".`,
      });
    }

    if (targetValue <= 0) {
      return res.status(400).json({ success: false, message: 'targetValue must be greater than 0.' });
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    if (parsedEnd <= parsedStart) {
      return res.status(400).json({ success: false, message: 'endDate must be after startDate.' });
    }

    const goal = await EnvironmentalGoal.create({
      department,
      category,
      targetValue,
      startDate: parsedStart,
      endDate: parsedEnd,
    });

    const populated = await goal.populate([
      { path: 'department', select: 'name code' },
      { path: 'category', select: 'name type' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an environmental goal
// @route   PUT /api/environmental-goals/:id
// @access  Private/Admin, Manager
exports.updateEnvironmentalGoal = async (req, res) => {
  try {
    const goal = await EnvironmentalGoal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Environmental goal not found.' });
    }

    const { targetValue, startDate, endDate } = req.body;

    if (targetValue !== undefined && targetValue <= 0) {
      return res.status(400).json({ success: false, message: 'targetValue must be greater than 0.' });
    }

    const updated = await EnvironmentalGoal.findByIdAndUpdate(
      req.params.id,
      { targetValue, startDate, endDate },
      { new: true, runValidators: true }
    ).populate([
      { path: 'department', select: 'name code' },
      { path: 'category', select: 'name type' },
    ]);

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an environmental goal
// @route   DELETE /api/environmental-goals/:id
// @access  Private/Admin
exports.deleteEnvironmentalGoal = async (req, res) => {
  try {
    const goal = await EnvironmentalGoal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Environmental goal not found.' });
    }

    await goal.deleteOne();
    res.status(200).json({ success: true, message: 'Environmental goal deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
