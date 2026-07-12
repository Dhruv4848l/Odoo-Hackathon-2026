const cron = require('node-cron');
const overdueFlagService = require('../services/compliance/overdueFlagService');

// Run compliance checks every hour
cron.schedule('0 * * * *', async () => {
  try {
    await overdueFlagService.flagOverdueIssues();
  } catch (error) {
    console.error('Error in compliance cron job:', error);
  }
});
