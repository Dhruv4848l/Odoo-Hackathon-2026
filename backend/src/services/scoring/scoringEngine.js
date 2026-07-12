/**
 * Rollup scoring calculations. (Dev D - Rule 7.2)
 */
const DepartmentScore = require('../../models/DepartmentScore');
const Settings = require('../../models/Settings');

exports.recalculateDepartmentScore = async (departmentId, year, month) => {
  console.log('Recalculating score for department:', departmentId);
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  
  // MOCK LOGIC: Real logic would aggregate data from CarbonTransaction, CSRActivity, and ComplianceIssue
  const environmentalScore = Math.floor(Math.random() * 100); 
  const socialScore = Math.floor(Math.random() * 100);
  const governanceScore = Math.floor(Math.random() * 100);
  
  const combinedScore = (environmentalScore * settings.envWeight) + 
                        (socialScore * settings.socialWeight) + 
                        (governanceScore * settings.govWeight);
                        
  const filter = { department: departmentId, year, month };
  const update = {
    environmentalScore,
    socialScore,
    governanceScore,
    combinedScore
  };
  
  return await DepartmentScore.findOneAndUpdate(filter, update, { new: true, upsert: true }).populate('department', 'name');
};
