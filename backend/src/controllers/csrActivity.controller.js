/**
 * CSR Activity Controller (Dev B)
 */
const CSRActivity = require('../models/CSRActivity');

// @desc    Get all CSR activities (with optional filters)
// @route   GET /api/csr-activities
// @access  Private
exports.getAll = async (req, res, next) => {
  try {
    const { department, status, category } = req.query;
    const filter = {};
    if (department) filter.department_id = department;
    if (status) filter.status = status;
    if (category) filter.category_id = category;

    const activities = await CSRActivity.find(filter)
      .populate('category_id', 'name')
      .populate('department_id', 'name code')
      .sort({ date: 1 });

    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single CSR activity
// @route   GET /api/csr-activities/:id
// @access  Private
exports.getById = async (req, res, next) => {
  try {
    const activity = await CSRActivity.findById(req.params.id)
      .populate('category_id', 'name')
      .populate('department_id', 'name code');

    if (!activity) {
      return res.status(404).json({ success: false, message: 'CSR Activity not found' });
    }

    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a CSR activity
// @route   POST /api/csr-activities
// @access  Private (Manager/Admin)
exports.create = async (req, res, next) => {
  try {
    const activity = await CSRActivity.create({
      ...req.body,
      // If no department provided, use requesting user's department
      department_id: req.body.department_id || req.user?.department,
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a CSR activity
// @route   PUT /api/csr-activities/:id
// @access  Private (Manager/Admin)
exports.update = async (req, res, next) => {
  try {
    const activity = await CSRActivity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ success: false, message: 'CSR Activity not found' });
    }

    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / cancel a CSR activity
// @route   DELETE /api/csr-activities/:id
// @access  Private (Manager/Admin)
exports.remove = async (req, res, next) => {
  try {
    const activity = await CSRActivity.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ success: false, message: 'CSR Activity not found' });
    }

    res.json({ success: true, message: 'Activity cancelled', data: activity });
  } catch (error) {
    next(error);
  }
};
