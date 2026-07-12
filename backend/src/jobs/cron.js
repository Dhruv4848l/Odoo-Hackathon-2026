const cron = require('node-cron');
const overdueFlagService = require('../services/compliance/overdueFlagService');
const scoringEngine = require('../services/scoring/scoringEngine');
// ✅ Correct path: cron.js is at src/jobs/, models are at src/models/
const DepartmentScore = require('../models/DepartmentScore');

// Run compliance checks every hour (Dev C's overdue flag service)
cron.schedule('0 * * * *', async () => {
  try {
    await overdueFlagService.flagOverdueIssues();
  } catch (error) {
    console.error('[CRON] Error in compliance overdue check:', error.message);
  }
});

// Dev D: Recalculate all department ESG scores daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('[CRON] Running daily scoring recalculation...');
    const allScores = await DepartmentScore.find().distinct('department');
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    for (const departmentId of allScores) {
      await scoringEngine.recalculateDepartmentScore(departmentId, year, month);
    }
    console.log(`[CRON] Scoring recalculation complete for ${allScores.length} departments.`);
  } catch (error) {
    console.error('[CRON] Error in daily scoring recalculation:', error.message);
  }
});
