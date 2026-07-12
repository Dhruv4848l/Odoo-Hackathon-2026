const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  envWeight: { type: Number, default: 0.4 }, // Default Env: 40%
  socialWeight: { type: Number, default: 0.3 }, // Default Social: 30%
  govWeight: { type: Number, default: 0.3 }, // Default Gov: 30%
  evidenceRequiredForCSR: { type: Boolean, default: true },
  evidenceRequiredForCompliance: { type: Boolean, default: true },
  autoEmissionCalc: { type: Boolean, default: true }, // If true, carbonEmitted = activityValue * factor.factor
  badgeAutoAward: { type: Boolean, default: true },
  complianceOverdueFlag: { type: Boolean, default: true },
  rewardRedemptionEnabled: { type: Boolean, default: true },
  notifyNewComplianceIssue: { type: Boolean, default: true },
  notifyApprovalDecisions: { type: Boolean, default: true },
  notifyPolicyReminders: { type: Boolean, default: true },
  notifyBadgeUnlocks: { type: Boolean, default: true },
  notifyEmailAlerts: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);

