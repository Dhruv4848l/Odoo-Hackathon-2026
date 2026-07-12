const ProductESGProfile = require('../models/ProductESGProfile');

// @desc    Get all product ESG profiles
// @route   GET /api/product-esg-profiles
// @access  Private
exports.getProductESGProfiles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const profiles = await ProductESGProfile.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product ESG profile
// @route   GET /api/product-esg-profiles/:id
// @access  Private
exports.getProductESGProfileById = async (req, res) => {
  try {
    const profile = await ProductESGProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Product ESG profile not found.' });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product ESG profile
// @route   POST /api/product-esg-profiles
// @access  Private/Admin, Manager
exports.createProductESGProfile = async (req, res) => {
  try {
    const { name, sku, carbonFootprint, socialScore, governanceScore } = req.body;

    if (!name || !sku || carbonFootprint === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, sku, and carbonFootprint are required.',
      });
    }

    // Check SKU uniqueness
    const existing = await ProductESGProfile.findOne({ sku });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A product with this SKU already exists.' });
    }

    const profile = await ProductESGProfile.create({
      name,
      sku,
      carbonFootprint,
      socialScore: socialScore !== undefined ? socialScore : 50,
      governanceScore: governanceScore !== undefined ? governanceScore : 50,
    });

    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a product ESG profile
// @route   PUT /api/product-esg-profiles/:id
// @access  Private/Admin, Manager
exports.updateProductESGProfile = async (req, res) => {
  try {
    const { name, sku, carbonFootprint, socialScore, governanceScore } = req.body;

    const existing = await ProductESGProfile.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product ESG profile not found.' });
    }

    // If changing SKU, check uniqueness
    if (sku && sku !== existing.sku) {
      const skuDup = await ProductESGProfile.findOne({ sku });
      if (skuDup) {
        return res.status(400).json({ success: false, message: 'A product with this SKU already exists.' });
      }
    }

    const updated = await ProductESGProfile.findByIdAndUpdate(
      req.params.id,
      { name, sku, carbonFootprint, socialScore, governanceScore },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product ESG profile
// @route   DELETE /api/product-esg-profiles/:id
// @access  Private/Admin
exports.deleteProductESGProfile = async (req, res) => {
  try {
    const profile = await ProductESGProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Product ESG profile not found.' });
    }

    await profile.deleteOne();
    res.status(200).json({ success: true, message: 'Product ESG profile deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
