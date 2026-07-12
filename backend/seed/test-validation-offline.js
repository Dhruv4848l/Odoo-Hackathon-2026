const mongoose = require('mongoose');

// Import Models
const ESGPolicy = require('../src/models/ESGPolicy');
const PolicyAcknowledgement = require('../src/models/PolicyAcknowledgement');
const Audit = require('../src/models/Audit');
const ComplianceIssue = require('../src/models/ComplianceIssue');
const Notification = require('../src/models/Notification');

async function runOfflineTests() {
  console.log('\x1b[34m[OFFLINE TEST] Starting local Mongoose schema constraint validations...\x1b[0m\n');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
      passedCount++;
    } else {
      console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
      failedCount++;
    }
  }

  // Helper to validate a document and return error object or null
  async function getValidationError(doc) {
    try {
      await doc.validate();
      return null;
    } catch (err) {
      return err;
    }
  }

  try {
    // --- 1. ESGPolicy Validation Tests ---
    console.log('\x1b[36m1. ESGPolicy Schema Constraints:\x1b[0m');
    
    // Correct policy
    const validPolicy = new ESGPolicy({
      title: 'Valid Waste Reduction Guideline',
      content: 'This document details all waste management standards and guidelines.',
      version: '1.2',
      category: new mongoose.Types.ObjectId(),
      mandatory: true
    });
    const policyErr = await getValidationError(validPolicy);
    assert(policyErr === null, 'Should validate a correct policy successfully.');

    // Title too short
    const shortTitlePolicy = new ESGPolicy({
      title: 'Sh',
      content: 'Valid content description about waste and recycle guidelines.',
      version: '1.0',
      category: new mongoose.Types.ObjectId()
    });
    const shortErr = await getValidationError(shortTitlePolicy);
    assert(shortErr !== null && shortErr.errors.title, 'Should reject title shorter than 3 characters.');

    // --- 2. PolicyAcknowledgement Validation Tests ---
    console.log('\n\x1b[36m2. PolicyAcknowledgement Schema Constraints:\x1b[0m');
    const validAck = new PolicyAcknowledgement({
      user: new mongoose.Types.ObjectId(),
      policy: new mongoose.Types.ObjectId(),
      signature: 'JohnDoe'
    });
    const ackErr = await getValidationError(validAck);
    assert(ackErr === null, 'Should validate a correct acknowledgment log.');

    const emptySignatureAck = new PolicyAcknowledgement({
      user: new mongoose.Types.ObjectId(),
      policy: new mongoose.Types.ObjectId(),
      signature: ''
    });
    const sigErr = await getValidationError(emptySignatureAck);
    assert(sigErr !== null && sigErr.errors.signature, 'Should reject empty signature log.');

    // --- 3. Audit Validation Tests ---
    console.log('\n\x1b[36m3. Audit Schema Constraints:\x1b[0m');
    const validAudit = new Audit({
      title: 'IT Department Energy Consumption Audit',
      auditor: new mongoose.Types.ObjectId(),
      department: new mongoose.Types.ObjectId(),
      auditDate: new Date(),
      status: 'Scheduled'
    });
    const auditErr = await getValidationError(validAudit);
    assert(auditErr === null, 'Should validate a scheduled audit.');

    // Out-of-bounds score (105)
    const invalidScoreAudit = new Audit({
      title: 'Operations Audit',
      auditor: new mongoose.Types.ObjectId(),
      department: new mongoose.Types.ObjectId(),
      auditDate: new Date(),
      status: 'Completed',
      findings: 'Findings listed here.',
      score: 105
    });
    const scoreErr = await getValidationError(invalidScoreAudit);
    assert(scoreErr !== null && scoreErr.errors.score, 'Should reject audit score greater than 100.');

    // --- 4. ComplianceIssue Validation Tests ---
    console.log('\n\x1b[36m4. ComplianceIssue Schema Constraints:\x1b[0m');
    const validIssue = new ComplianceIssue({
      title: 'Water disposal valve leakage',
      description: 'Leakage discovered near building C disposal system.',
      department: new mongoose.Types.ObjectId(),
      severity: 'High',
      owner: new mongoose.Types.ObjectId(),
      dueDate: new Date(),
      status: 'Open'
    });
    const issueErr = await getValidationError(validIssue);
    assert(issueErr === null, 'Should validate a correct compliance issue.');

    // Invalid Severity
    const invalidSeverityIssue = new ComplianceIssue({
      title: 'Water disposal valve leakage',
      description: 'Leakage discovered.',
      department: new mongoose.Types.ObjectId(),
      severity: 'SuperCritical', // Invalid option
      owner: new mongoose.Types.ObjectId(),
      dueDate: new Date()
    });
    const sevErr = await getValidationError(invalidSeverityIssue);
    assert(sevErr !== null && sevErr.errors.severity, 'Should reject invalid severity option.');

    // --- 5. Notification Validation Tests ---
    console.log('\n\x1b[36m5. Notification Schema Constraints:\x1b[0m');
    const validNotification = new Notification({
      user: new mongoose.Types.ObjectId(),
      type: 'Alert',
      message: 'Urgent: Compliance deadline is tomorrow.'
    });
    const notifErr = await getValidationError(validNotification);
    assert(notifErr === null, 'Should validate a correct notification.');

    const invalidTypeNotif = new Notification({
      user: new mongoose.Types.ObjectId(),
      type: 'MarketingAlert', // Invalid option
      message: 'Promo code active'
    });
    const typeErr = await getValidationError(invalidTypeNotif);
    assert(typeErr !== null && typeErr.errors.type, 'Should reject invalid notification type.');

    console.log(`\n\x1b[34m[OFFLINE TEST SUMMARY] Passed: ${passedCount}, Failed: ${failedCount}\x1b[0m`);
    if (failedCount > 0) {
      process.exit(1);
    } else {
      console.log('\x1b[32m✔ All local Mongoose validations are correct.\x1b[0m');
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runOfflineTests();
