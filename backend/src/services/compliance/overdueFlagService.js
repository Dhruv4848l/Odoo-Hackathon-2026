const ComplianceIssue = require('../../models/ComplianceIssue');
const notificationService = require('../notifications/notificationService');

/**
 * Automated compliance checks. Checks for overdue issues and updates their state.
 * (Dev C - Rule 7.6)
 */
exports.flagOverdueIssues = async () => {
  try {
    console.log('[COMPLIANCE SERVICE] Checking for overdue compliance issues...');
    const now = new Date();

    // 1. Find all issues that are past due date and not resolved or already marked overdue
    const overdueIssues = await ComplianceIssue.find({
      dueDate: { $lt: now },
      status: { $in: ['Open', 'InProgress'] },
    });

    if (overdueIssues.length === 0) {
      console.log('[COMPLIANCE SERVICE] No new overdue issues found.');
      return [];
    }

    console.log(`[COMPLIANCE SERVICE] Found ${overdueIssues.length} overdue issues. Updating status...`);

    const updatedIssues = [];

    // 2. Loop through and update them to 'Overdue', and trigger notification to owner
    for (const issue of overdueIssues) {
      issue.status = 'Overdue';
      await issue.save();
      
      updatedIssues.push(issue);

      // Trigger notification alert to the assigned owner
      await notificationService.notify(issue.owner, 'Alert', {
        message: `CRITICAL: Compliance Issue "${issue.title}" is OVERDUE! (Due: ${issue.dueDate.toLocaleDateString()})`,
      });
    }

    return updatedIssues;
  } catch (error) {
    console.error('[COMPLIANCE SERVICE ERROR] Failed to flag overdue issues:', error.message);
    return [];
  }
};
