const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Category = require('../src/models/Category');
const ESGPolicy = require('../src/models/ESGPolicy');
const PolicyAcknowledgement = require('../src/models/PolicyAcknowledgement');
const Audit = require('../src/models/Audit');
const ComplianceIssue = require('../src/models/ComplianceIssue');
const Notification = require('../src/models/Notification');

const notificationService = require('../src/services/notifications/notificationService');
const overdueFlagService = require('../src/services/compliance/overdueFlagService');

async function runE2ETests() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('\x1b[34m[E2E TEST] Connecting to database...\x1b[0m');
    await mongoose.connect(mongoUri);
    console.log('\x1b[32m[E2E TEST] Connected successfully.\x1b[0m');

    // 1. Fetch departments and categories (pre-seeded)
    const mfgDept = await Department.findOne({ code: 'MFG' });
    const govCategory = await Category.findOne({ type: 'Governance', name: 'Policy Agreement' });

    if (!mfgDept || !govCategory) {
      throw new Error('Pre-seeded data missing. Please run "npm run seed" first.');
    }

    console.log(`[E2E TEST] Using Dept: ${mfgDept.name} (${mfgDept.code})`);
    console.log(`[E2E TEST] Using Category: ${govCategory.name}`);

    // 2. Create testing users
    console.log('\n\x1b[36m--- STEP 1: Creating test users ---\x1b[0m');
    await User.deleteMany({ email: { $in: ['test-employee@ecosphere.com', 'test-auditor@ecosphere.com', 'test-manager@ecosphere.com'] } });
    
    const employee = await User.create({
      username: 'testEmployee',
      email: 'test-employee@ecosphere.com',
      password: 'password123',
      role: 'Employee',
      department: mfgDept._id,
    });
    console.log(`[x] Created Employee: ${employee.username}`);

    const auditor = await User.create({
      username: 'testAuditor',
      email: 'test-auditor@ecosphere.com',
      password: 'password123',
      role: 'Auditor',
      department: mfgDept._id,
    });
    console.log(`[x] Created Auditor: ${auditor.username}`);

    const manager = await User.create({
      username: 'testManager',
      email: 'test-manager@ecosphere.com',
      password: 'password123',
      role: 'Manager',
      department: mfgDept._id,
    });
    console.log(`[x] Created Manager: ${manager.username}`);

    // 3. Create compliance policy
    console.log('\n\x1b[36m--- STEP 2: Creating compliance policy ---\x1b[0m');
    await ESGPolicy.deleteMany({ title: 'E2E Test Environmental Policy v1' });
    const policy = await ESGPolicy.create({
      title: 'E2E Test Environmental Policy v1',
      content: 'This policy governs standard operational guidelines to limit scope 2 electricity emission factors.',
      category: govCategory._id,
      mandatory: true,
      version: '1.0',
    });
    console.log(`[x] Published Policy: "${policy.title}"`);

    // 4. Employee acknowledges policy
    console.log('\n\x1b[36m--- STEP 3: Acknowledging policy ---\x1b[0m');
    await PolicyAcknowledgement.deleteMany({ user: employee._id });
    
    const acknowledgement = await PolicyAcknowledgement.create({
      user: employee._id,
      policy: policy._id,
      signature: employee.username,
    });
    console.log(`[x] Policy acknowledged by ${employee.username}. Signature: "/s/ ${acknowledgement.signature}"`);

    // 5. Audit Scheduling & Completion
    console.log('\n\x1b[36m--- STEP 4: Auditing Flow ---\x1b[0m');
    await Audit.deleteMany({ title: 'E2E Logistics Audit' });
    
    const audit = await Audit.create({
      title: 'E2E Logistics Audit',
      auditor: auditor._id,
      department: mfgDept._id,
      auditDate: new Date(),
      status: 'InProgress',
    });
    console.log(`[x] Scheduled Audit: "${audit.title}"`);

    audit.findings = 'No major carbon leaks, minor compliance warning issued.';
    audit.score = 90;
    audit.status = 'Completed';
    await audit.save();
    console.log(`[x] Completed Audit score: ${audit.score}/100. Findings: "${audit.findings}"`);

    // 6. Raising Compliance Issue & Testing Overdue Flagging
    console.log('\n\x1b[36m--- STEP 5: Compliance Issues & Overdue Cron Trigger ---\x1b[0m');
    await ComplianceIssue.deleteMany({ title: { $in: ['Future Due Issue', 'Past Due Overdue Test'] } });

    // Issue A: Due in future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const activeIssue = await ComplianceIssue.create({
      title: 'Future Due Issue',
      description: 'Minor carbon log gap',
      department: mfgDept._id,
      severity: 'Medium',
      owner: manager._id,
      dueDate: futureDate,
      status: 'Open',
    });
    console.log(`[x] Raised Active Issue: "${activeIssue.title}" (Due: ${activeIssue.dueDate.toLocaleDateString()})`);

    // Issue B: Due in past (should trigger Overdue status)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const expiredIssue = await ComplianceIssue.create({
      title: 'Past Due Overdue Test',
      description: 'Leaking container on production floor',
      department: mfgDept._id,
      severity: 'Critical',
      owner: manager._id,
      dueDate: pastDate,
      status: 'Open',
    });
    console.log(`[x] Raised Past Due Issue: "${expiredIssue.title}" (Due: ${expiredIssue.dueDate.toLocaleDateString()})`);

    // Trigger overdue checker service
    console.log('\n\x1b[34m[E2E TEST] Manually triggering overdue flag service...\x1b[0m');
    const flagged = await overdueFlagService.flagOverdueIssues();
    console.log(`[E2E TEST] Service ran. Flagged ${flagged.length} issues.`);

    // Verify expiredIssue status was shifted to 'Overdue'
    const verifiedIssue = await ComplianceIssue.findById(expiredIssue._id);
    console.log(`[x] Verified Issue status is now: \x1b[31m"${verifiedIssue.status}"\x1b[0m (expected: "Overdue")`);

    // 7. Verify Notification Logs
    console.log('\n\x1b[36m--- STEP 6: Verifying Notifications ---\x1b[0m');
    const notifications = await Notification.find({ user: manager._id }).sort({ createdAt: -1 });
    console.log(`[E2E TEST] Found ${notifications.length} notifications dispatched to Manager (${manager.username}):`);
    notifications.forEach((n, idx) => {
      console.log(`  ${idx + 1}. [${n.type}] ${n.message} (Read: ${n.read})`);
    });

    console.log('\n\x1b[32m[E2E TEST] All Governance E2E tests passed successfully!\x1b[0m');
    process.exit(0);
  } catch (error) {
    console.error('\n\x1b[31m[E2E TEST ERROR] Test failed:\x1b[0m', error.message);
    process.exit(1);
  }
}

runE2ETests();
