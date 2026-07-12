const ESGPolicy = require('../models/ESGPolicy');

// Create Policy
exports.createPolicy = async (req, res, next) => {
  try {
    const { title, content, version, category, mandatory } = req.body;

    const policy = await ESGPolicy.create({
      title,
      content,
      version,
      category,
      mandatory,
    });

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: policy,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Policies
exports.getAllPolicies = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const policies = await ESGPolicy.find(filter).populate('category');

    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Policy
exports.getPolicyById = async (req, res, next) => {
  try {
    const policy = await ESGPolicy.findById(req.params.id).populate('category');
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    next(error);
  }
};

// Update Policy
exports.updatePolicy = async (req, res, next) => {
  try {
    const policy = await ESGPolicy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      data: policy,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Policy
exports.deletePolicy = async (req, res, next) => {
  try {
    const policy = await ESGPolicy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Policy deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
