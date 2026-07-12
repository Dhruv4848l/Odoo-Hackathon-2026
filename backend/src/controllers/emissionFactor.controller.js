const EmissionFactor = require('../models/EmissionFactor');
const Category = require('../models/Category');
const { validateRefExists } = require('../services/validation/refIntegrity');

// @desc    Get all emission factors
// @route   GET /api/emission-factors
// @access  Private
exports.getEmissionFactors = async (req, res) => {
  try {
    const filter = {};
    if (req.query.categoryId) {
      filter.category = req.query.categoryId;
    }

    const factors = await EmissionFactor.find(filter).populate('category', 'name type');
    res.status(200).json({
      success: true,
      count: factors.length,
      data: factors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single emission factor by ID
// @route   GET /api/emission-factors/:id
// @access  Private
exports.getEmissionFactorById = async (req, res) => {
  try {
    const factor = await EmissionFactor.findById(req.params.id).populate('category', 'name type');
    if (!factor) {
      return res.status(404).json({ success: false, message: 'Emission factor not found.' });
    }
    res.status(200).json({ success: true, data: factor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new emission factor
// @route   POST /api/emission-factors
// @access  Private/Admin
exports.createEmissionFactor = async (req, res) => {
  try {
    const { name, category, factor, unit, source } = req.body;

    if (!name || !category || factor === undefined || !unit) {
      return res.status(400).json({ success: false, message: 'name, category, factor and unit are required.' });
    }

    // Validate category reference exists
    const categoryExists = await validateRefExists(Category, category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Invalid or non-existent category ID.' });
    }

    // Validate category is of type "Emission"
    const categoryDoc = await Category.findById(category);
    if (categoryDoc.type !== 'Emission') {
      return res.status(400).json({
        success: false,
        message: `Category must be of type "Emission". Provided category type is "${categoryDoc.type}".`,
      });
    }

    if (factor <= 0) {
      return res.status(400).json({ success: false, message: 'Factor value must be greater than 0.' });
    }

    const newFactor = await EmissionFactor.create({ name, category, factor, unit, source });
    const populated = await newFactor.populate('category', 'name type');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an emission factor
// @route   PUT /api/emission-factors/:id
// @access  Private/Admin
exports.updateEmissionFactor = async (req, res) => {
  try {
    const { name, category, factor, unit, source } = req.body;

    const existing = await EmissionFactor.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Emission factor not found.' });
    }

    // If updating category reference, re-validate it
    if (category) {
      const categoryExists = await validateRefExists(Category, category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Invalid or non-existent category ID.' });
      }

      const categoryDoc = await Category.findById(category);
      if (categoryDoc.type !== 'Emission') {
        return res.status(400).json({
          success: false,
          message: `Category must be of type "Emission". Provided category type is "${categoryDoc.type}".`,
        });
      }
    }

    if (factor !== undefined && factor <= 0) {
      return res.status(400).json({ success: false, message: 'Factor value must be greater than 0.' });
    }

    const updated = await EmissionFactor.findByIdAndUpdate(
      req.params.id,
      { name, category, factor, unit, source },
      { new: true, runValidators: true }
    ).populate('category', 'name type');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an emission factor
// @route   DELETE /api/emission-factors/:id
// @access  Private/Admin
exports.deleteEmissionFactor = async (req, res) => {
  try {
    const factor = await EmissionFactor.findById(req.params.id);
    if (!factor) {
      return res.status(404).json({ success: false, message: 'Emission factor not found.' });
    }

    await factor.deleteOne();
    res.status(200).json({ success: true, message: 'Emission factor deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
