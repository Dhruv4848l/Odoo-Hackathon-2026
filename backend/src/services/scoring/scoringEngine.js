/**
 * Rollup scoring calculations. (Dev D - Rule 7.2)
 */
const DepartmentScore = require('../../models/DepartmentScore');
const Settings = require('../../models/Settings');
const CarbonTransaction = require('../../models/CarbonTransaction');
const EnvironmentalGoal = require('../../models/EnvironmentalGoal');
const EmployeeParticipation = require('../../models/EmployeeParticipation');
const User = require('../../models/User');
const PolicyAcknowledgement = require('../../models/PolicyAcknowledgement');
const ComplianceIssue = require('../../models/ComplianceIssue');

exports.recalculateDepartmentScore = async (departmentId, year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
  console.log(`[SCORING ENGINE] Recalculating ESG scores for department ${departmentId} (${year}-${month})`);
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});

  // 1. Environmental Score (0-100): Evaluate against targets or baseline emissions
  const transactions = await CarbonTransaction.find({ departmentId });
  const totalEmissions = transactions.reduce((acc, t) => acc + (t.calculatedCO2e || 0), 0);
  const goal = await EnvironmentalGoal.findOne({ departmentId, year });
  let environmentalScore = 80; // Baseline strong score
  if (goal && goal.targetCO2e > 0) {
    const ratio = totalEmissions / goal.targetCO2e;
    environmentalScore = Math.max(10, Math.min(100, Math.round((1 - (ratio - 1)) * 80)));
  } else if (totalEmissions > 0) {
    environmentalScore = Math.max(20, Math.min(95, Math.round(100 - (totalEmissions / 1000))));
  }

  // 2. Social Score (0-100): Employee participation rate & approved CSR activities
  const deptUsers = await User.find({ department: departmentId });
  const deptUserIds = deptUsers.map(u => u._id);
  const participations = await EmployeeParticipation.find({
    employee_id: { $in: deptUserIds },
    approval_status: 'Approved'
  });
  let socialScore = 75;
  if (deptUsers.length > 0) {
    const participationRate = Math.min(1, participations.length / deptUsers.length);
    socialScore = Math.round(60 + (participationRate * 40));
  }

  // 3. Governance Score (0-100): Policy acknowledgements & resolved vs open compliance issues
  const acks = await PolicyAcknowledgement.find({ user: { $in: deptUserIds }, acknowledged: true });
  const openIssues = await ComplianceIssue.countDocuments({ department: departmentId, status: { $ne: 'Resolved' } });
  let governanceScore = 85;
  if (openIssues > 0) {
    governanceScore = Math.max(30, 85 - (openIssues * 15));
  }
  if (deptUsers.length > 0 && acks.length > 0) {
    const ackRate = Math.min(1, acks.length / deptUsers.length);
    governanceScore = Math.round(governanceScore * 0.7 + (ackRate * 100) * 0.3);
  }

  // Calculate Weighted Combined Score
  const combinedScore = Math.round(
    (environmentalScore * (settings.envWeight || 0.4)) +
    (socialScore * (settings.socialWeight || 0.3)) +
    (governanceScore * (settings.govWeight || 0.3))
  );

  const filter = { department: departmentId, year, month };
  const update = {
    environmentalScore,
    socialScore,
    governanceScore,
    combinedScore
  };

  return await DepartmentScore.findOneAndUpdate(filter, update, { new: true, upsert: true }).populate('department', 'name');
};

