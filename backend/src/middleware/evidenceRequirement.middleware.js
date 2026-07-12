/**
 * Evidence Requirement Middleware — Business Rule 7.5 (Dev B/C)
 * Reads the Settings collection to check if evidence upload is required.
 * If ON, blocks the approval route unless a proof file is attached.
 *
 * @param {string} settingField - Field name in Settings model to check (e.g. 'evidenceRequiredForCSR')
 */
const Settings = require('../models/Settings');

module.exports = (settingField) => {
  return async (req, res, next) => {
    try {
      const settings = await Settings.findOne().sort({ createdAt: -1 });

      // If settings not found or toggle is OFF, allow through
      if (!settings || !settings[settingField]) {
        return next();
      }

      // Toggle is ON: require a proof file attachment
      if (!req.file && !req.body.proof) {
        return res.status(400).json({
          success: false,
          message: 'Evidence/proof file is required before approval can be granted.',
        });
      }

      next();
    } catch (error) {
      console.error('[EVIDENCE MIDDLEWARE ERROR]', error);
      next(error);
    }
  };
};
