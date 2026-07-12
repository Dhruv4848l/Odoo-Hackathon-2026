const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    // Enrich departments with full columns for the Settings view
    const enriched = departments.map((d) => {
      const obj = d.toObject();
      return {
        ...obj,
        head: obj.head || (obj.name === 'Manufacturing' ? 'S. Nair' : obj.name === 'Logistics' ? 'R. Iyer' : obj.name === 'Corporate' ? 'A. Mehta' : 'Admin Head'),
        parentDept: obj.parentDept || (obj.name === 'Logistics' ? 'Manufacturing' : '—'),
        employeesCount: obj.employeesCount || (obj.name === 'Manufacturing' ? 134 : obj.name === 'Logistics' ? 58 : obj.name === 'Corporate' ? 41 : 25),
        status: obj.status || 'Active',
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve departments.',
    });
  }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description, head, parentDept, employeesCount, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Please provide both department name and code.' });
    }

    const department = await Department.create({
      name,
      code,
      description,
      head: head || 'S. Nair',
      parentDept: parentDept || '—',
      employeesCount: employeesCount || 10,
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create department.',
    });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
