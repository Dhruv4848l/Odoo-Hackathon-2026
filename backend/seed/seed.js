const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Dev A models
const Department = require('../src/models/Department');
const Category = require('../src/models/Category');
const User = require('../src/models/User');
const EmissionFactor = require('../src/models/EmissionFactor');

// Dev B models
const Badge = require('../src/models/Badge');
const Challenge = require('../src/models/Challenge');
const Reward = require('../src/models/Reward');

const departments = [
  { name: 'Human Resources', code: 'HR', description: 'HR and People Operations' },
  { name: 'Information Technology', code: 'IT', description: 'IT and Infrastructure' },
  { name: 'Manufacturing & Operations', code: 'MFG', description: 'Production lines and operations' },
  { name: 'Finance & Expense Management', code: 'FIN', description: 'Corporate finance and travel logs' },
  { name: 'Logistics & Fleet', code: 'FLEET', description: 'Corporate vehicle fleet and shipping logistics' },
];

const categories = [
  // Environmental Emission Categories
  { name: 'Purchased Electricity', type: 'Emission', description: 'Scope 2 indirect emissions' },
  { name: 'Manufacturing Operations', type: 'Emission', description: 'Scope 1 direct production emissions' },
  { name: 'Business Expenses', type: 'Emission', description: 'Scope 3 corporate expenses & purchasing' },
  { name: 'Fleet Travel', type: 'Emission', description: 'Scope 1 fuel combusted from fleet' },

  // Social CSR Categories
  { name: 'Eco-Volunteering', type: 'Social', description: 'Tree planting, cleanups, community action' },
  { name: 'Health & Wellness', type: 'Social', description: 'Corporate physical and mental wellbeing initiatives' },
  { name: 'Skill & Development', type: 'Social', description: 'Internal trainings, cross-department workshops' },

  // Governance Categories
  { name: 'Policy Agreement', type: 'Governance', description: 'Compliance policies and user signoffs' },
  { name: 'Audit & Review', type: 'Governance', description: 'Internal & external safety, compliance audits' },
];

const defaultBadges = [
  {
    name: 'Eco Warrior',
    description: 'Earn 500 XP through CSR and ESG tasks.',
    unlock_rule: { type: 'xp', value: 500 },
    icon: 'eco_warrior.png'
  },
  {
    name: 'Green Champion',
    description: 'Participate in at least 3 approved CSR activities.',
    unlock_rule: { type: 'csr_count', value: 3 },
    icon: 'green_champion.png'
  },
  {
    name: 'Challenge Master',
    description: 'Successfully complete 2 approved challenges.',
    unlock_rule: { type: 'challenge_count', value: 2 },
    icon: 'challenge_master.png'
  },
  {
    name: 'Point Millionaire',
    description: 'Accumulate a balance of 1000 ESG points.',
    unlock_rule: { type: 'points', value: 1000 },
    icon: 'points_millionaire.png'
  }
];

const defaultRewards = [
  {
    name: 'Eco-friendly Water Bottle',
    description: 'Durable, double-walled stainless steel insulated water bottle.',
    points_required: 150,
    stock: 10,
    status: 'Active'
  },
  {
    name: 'Organic Cotton Tote Bag',
    description: 'Heavy duty, reusable bag made from 100% organic cotton.',
    points_required: 80,
    stock: 25,
    status: 'Active'
  },
  {
    name: 'Solar Powered Powerbank',
    description: '10,000mAh rugged outdoor power bank with integrated solar panel.',
    points_required: 500,
    stock: 5,
    status: 'Active'
  },
  {
    name: 'Tree Planted In Your Name',
    description: 'We will plant a native tree in your name and provide a digital certificate.',
    points_required: 200,
    stock: 999,
    status: 'Active'
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log(`[SEED] Connecting to database: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
    await mongoose.connect(mongoUri);

    console.log('[SEED] Clearing existing base collections...');
    await Department.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await EmissionFactor.deleteMany({});
    await Badge.deleteMany({});
    await Challenge.deleteMany({});
    await Reward.deleteMany({});

    console.log('[SEED] Seeding Departments...');
    const seededDepts = await Department.insertMany(departments);
    console.log(`[SEED] Successfully seeded ${seededDepts.length} departments.`);

    console.log('[SEED] Seeding Categories...');
    const seededCategories = await Category.insertMany(categories);
    console.log(`[SEED] Successfully seeded ${seededCategories.length} categories.`);

    // --- Dev A: Emission Factors ---
    console.log('[SEED] Seeding Emission Factors...');
    const emissionCat = seededCategories.find(c => c.name === 'Purchased Electricity');
    const mfgCat = seededCategories.find(c => c.name === 'Manufacturing Operations');
    const fleetCat = seededCategories.find(c => c.name === 'Fleet Travel');
    const bizCat = seededCategories.find(c => c.name === 'Business Expenses');

    const emissionFactors = [
      { name: 'Grid Electricity (UK)', category: emissionCat._id, factor: 0.233, unit: 'kWh', source: 'DEFRA 2023' },
      { name: 'Grid Electricity (IN)', category: emissionCat._id, factor: 0.708, unit: 'kWh', source: 'CEA India 2022' },
      { name: 'Natural Gas Combustion', category: mfgCat._id, factor: 2.04, unit: 'cubic metre', source: 'IPCC AR6' },
      { name: 'Diesel Vehicle', category: fleetCat._id, factor: 2.68, unit: 'litre', source: 'DEFRA 2023' },
      { name: 'Petrol Vehicle', category: fleetCat._id, factor: 2.31, unit: 'litre', source: 'DEFRA 2023' },
      { name: 'Air Travel (Short Haul)', category: bizCat._id, factor: 0.255, unit: 'km', source: 'DEFRA 2023' },
    ];
    const seededFactors = await EmissionFactor.insertMany(emissionFactors);
    console.log(`[SEED] Successfully seeded ${seededFactors.length} emission factors.`);

    // --- Admin User & Sample Employees ---
    console.log('[SEED] Seeding Admin & Employee Users...');
    const hrDept = seededDepts.find(d => d.code === 'HR') || seededDepts[0];
    const mfgDept = seededDepts.find(d => d.code === 'MFG') || seededDepts[0];
    const itDept = seededDepts.find(d => d.code === 'IT') || seededDepts[0];
    const logDept = seededDepts.find(d => d.code === 'LOG') || seededDepts[0];

    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'admin@gmail.com',
      role: 'Admin',
      department: hrDept._id,
    });

    const aditiUser = await User.create({
      username: 'Aditi Rao',
      email: 'aditi.rao@ecosphere.com',
      password: 'Password123!',
      role: 'Employee',
      department: hrDept._id,
    });

    const karanUser = await User.create({
      username: 'Karan Shah',
      email: 'karan.shah@ecosphere.com',
      password: 'Password123!',
      role: 'Employee',
      department: itDept._id,
    });

    const priyaUser = await User.create({
      username: 'Priya Nair',
      email: 'priya.nair@ecosphere.com',
      password: 'Password123!',
      role: 'Employee',
      department: mfgDept._id,
    });

    const rohanUser = await User.create({
      username: 'Rohan Mehta',
      email: 'rohan.mehta@ecosphere.com',
      password: 'Password123!',
      role: 'Employee',
      department: logDept._id,
    });

    const neelamUser = await User.create({
      username: 'Neelam Verma',
      email: 'neelam.verma@ecosphere.com',
      password: 'Password123!',
      role: 'Employee',
      department: hrDept._id,
    });

    console.log(`[SEED] Seeded Admin & 5 Employee users.`);

    // --- Dev B: Badges ---
    console.log('[SEED] Seeding Badges...');
    const seededBadges = await Badge.insertMany(defaultBadges);
    console.log(`[SEED] Successfully seeded ${seededBadges.length} badges.`);

    // --- Dev B: Rewards ---
    console.log('[SEED] Seeding Rewards...');
    const seededRewards = await Reward.insertMany(defaultRewards);
    console.log(`[SEED] Successfully seeded ${seededRewards.length} rewards.`);

    // --- Dev B: Challenges ---
    const ecoVolunteeringCat = seededCategories.find(c => c.name === 'Eco-Volunteering');
    const skillDevCat = seededCategories.find(c => c.name === 'Skill & Development');

    if (ecoVolunteeringCat && skillDevCat) {
      const defaultChallenges = [
        {
          title: 'Zero Waste Week',
          description: 'Avoid single-use plastics and send zero non-compostable/recyclable waste to landfill for 7 days.',
          category_id: ecoVolunteeringCat._id,
          xp: 150,
          difficulty: 'Medium',
          evidence_required: true,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'Active'
        },
        {
          title: 'Daily Office Bike Commute',
          description: 'Commute to the office using a bicycle instead of a fossil-fuel vehicle.',
          category_id: ecoVolunteeringCat._id,
          xp: 100,
          difficulty: 'Easy',
          evidence_required: true,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'Active'
        },
        {
          title: 'Carbon Footprint Awareness Quiz',
          description: 'Take the internal ESG awareness quiz and get at least 80% correct.',
          category_id: skillDevCat._id,
          xp: 50,
          difficulty: 'Easy',
          evidence_required: false,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'Active'
        }
      ];

      console.log('[SEED] Seeding Challenges...');
      const seededChallenges = await Challenge.insertMany(defaultChallenges);
      console.log(`[SEED] Successfully seeded ${seededChallenges.length} challenges.`);
    }

    // --- Dev B: CSR Activities (matching wireframe Image 1) ---
    const CSRActivity = require('../src/models/CSRActivity');
    await CSRActivity.deleteMany({});
    const sampleCSRs = [
      {
        title: 'Tree Plantation',
        description: 'Planting 500 native trees in the metropolitan green belt and restoring biodiversity.',
        category_id: ecoVolunteeringCat?._id || seededCategories[0]._id,
        department_id: hrDept?._id || seededDepts[0]._id,
        date: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        location: 'City Botanical Garden',
        xpReward: 50,
        pointsReward: 50,
        maxParticipants: 50,
        joinedCount: 24,
        evidenceRequired: true,
        status: 'Scheduled',
      },
      {
        title: 'Blood Donation',
        description: 'Annual corporate blood donation camp in partnership with Red Cross Society.',
        category_id: ecoVolunteeringCat?._id || seededCategories[0]._id,
        department_id: hrDept?._id || seededDepts[0]._id,
        date: new Date(Date.now() + 10 * 24 * 3600 * 1000),
        location: 'Corporate Health Wing',
        xpReward: 80,
        pointsReward: 70,
        maxParticipants: 40,
        joinedCount: 18,
        evidenceRequired: true,
        status: 'Scheduled',
      },
      {
        title: 'Beach Cleanup',
        description: 'Removing plastic debris along the 5km coastal shoreline community initiative.',
        category_id: ecoVolunteeringCat?._id || seededCategories[0]._id,
        department_id: hrDept?._id || seededDepts[0]._id,
        date: new Date(Date.now() + 14 * 24 * 3600 * 1000),
        location: 'Sunset Beach',
        xpReward: 100,
        pointsReward: 100,
        maxParticipants: 60,
        joinedCount: 31,
        evidenceRequired: false,
        status: 'Scheduled',
      },
      {
        title: 'ESG Workshop',
        description: 'Interactive workshop on reducing personal and corporate carbon footprint.',
        category_id: skillDevCat?._id || seededCategories[0]._id,
        department_id: hrDept?._id || seededDepts[0]._id,
        date: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        location: 'Virtual Zoom Hall',
        xpReward: 30,
        pointsReward: 30,
        maxParticipants: 200,
        joinedCount: 52,
        evidenceRequired: false,
        status: 'Scheduled',
      },
    ];
    const seededCSRs = await CSRActivity.insertMany(sampleCSRs);
    console.log(`[SEED] Successfully seeded ${seededCSRs.length} CSR activities matching UI specifications.`);

    // --- Dev B: Employee Participation Approval Queue ---
    const EmployeeParticipation = require('../src/models/EmployeeParticipation');
    await EmployeeParticipation.deleteMany({});
    const sampleParticipations = [
      {
        employee_id: aditiUser._id,
        activity_id: seededCSRs[0]._id, // Tree Plantation
        proof: 'photo.jpg',
        points_earned: 50,
        approval_status: 'Pending',
        completion_date: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        employee_id: karanUser._id,
        activity_id: seededCSRs[3]._id, // ESG Workshop
        proof: 'cert.pdf',
        points_earned: 30,
        approval_status: 'Approved',
        completion_date: new Date(Date.now() - 24 * 3600 * 1000),
      },
      {
        employee_id: priyaUser._id,
        activity_id: seededCSRs[1]._id, // Blood Donation
        proof: 'donation_cert.png',
        points_earned: 80,
        approval_status: 'Pending',
        completion_date: new Date(Date.now() - 5 * 3600 * 1000),
      },
      {
        employee_id: rohanUser._id,
        activity_id: seededCSRs[2]._id, // Beach Cleanup
        proof: 'cleanup_group.jpg',
        points_earned: 100,
        approval_status: 'Approved',
        completion_date: new Date(Date.now() - 48 * 3600 * 1000),
      },
      {
        employee_id: neelamUser._id,
        activity_id: seededCSRs[0]._id, // Tree Plantation
        proof: 'sapling.jpg',
        points_earned: 50,
        approval_status: 'Pending',
        completion_date: new Date(Date.now() - 1 * 3600 * 1000),
      },
    ];
    const seededParticipations = await EmployeeParticipation.insertMany(sampleParticipations);
    console.log(`[SEED] Successfully seeded ${seededParticipations.length} Employee Participation approval queue records.`);

    // --- Dev C: Governance Policies ---
    const ESGPolicy = require('../src/models/ESGPolicy');
    await ESGPolicy.deleteMany({});
    const policyCat = seededCategories.find(c => c.name === 'Policy Agreement');
    const samplePolicies = [
      {
        title: 'Global Anti-Bribery & Corruption Policy',
        version: 'v2.4',
        category: policyCat?._id || seededCategories[0]._id,
        content: 'Mandatory compliance rules on ethical vendor interactions, gifts, and third-party transparency standards across all operational regions.',
      },
      {
        title: 'Scope 1 & 2 Carbon Reporting Framework',
        version: 'v1.1',
        category: policyCat?._id || seededCategories[0]._id,
        content: 'Standard operating procedure for logging monthly utility, manufacturing electricity, and fuel consumption accurately.',
      },
      {
        title: 'Workplace Diversity & Inclusion Charter',
        version: 'v3.0',
        category: policyCat?._id || seededCategories[0]._id,
        content: 'Guidelines ensuring fair, equitable, and safe workplace opportunities and respect across all corporate departments.',
      },
    ];
    await ESGPolicy.insertMany(samplePolicies);
    console.log(`[SEED] Successfully seeded ${samplePolicies.length} ESG policies.`);

    // --- Dev A: Product ESG Profiles ---
    const ProductESGProfile = require('../src/models/ProductESGProfile');
    await ProductESGProfile.deleteMany({});
    const sampleProducts = [
      { name: 'Eco-friendly Laptop Stand', sku: 'LTP-STD-ECO', carbonFootprint: 12.5, socialScore: 85, governanceScore: 90 },
      { name: 'Recycled Paper Notepad', sku: 'NTP-REC-PPR', carbonFootprint: 1.2, socialScore: 78, governanceScore: 80 },
      { name: 'Reusable Bamboo Cup', sku: 'CUP-BMB-REU', carbonFootprint: 3.4, socialScore: 92, governanceScore: 88 },
    ];
    await ProductESGProfile.insertMany(sampleProducts);
    console.log(`[SEED] Successfully seeded ${sampleProducts.length} product ESG profiles.`);

    // --- Dev A: Sample Historical Carbon Transactions ---
    const CarbonTransaction = require('../src/models/CarbonTransaction');
    await CarbonTransaction.deleteMany({});
    const gridUK = seededFactors[0];
    const gridIN = seededFactors[1];
    const naturalGas = seededFactors[2];
    const diesel = seededFactors[3];

    const txMfgDept = seededDepts.find(d => d.code === 'MFG');
    const txItDept = seededDepts.find(d => d.code === 'IT');
    const txFleetDept = seededDepts.find(d => d.code === 'FLEET');

    // Create transactions that align with the goals in the screenshot
    const sampleTransactions = [
      // Fleet department goal target: 500, current: 390. FleetTravel category (diesel).
      {
        department: txFleetDept._id,
        user: adminUser._id,
        emissionFactor: diesel._id,
        activityValue: 390 / diesel.factor, // 145.52 litres
        carbonEmitted: 390,
        transactionDate: new Date('2026-05-15'),
        description: 'Monthly fleet logistics fuel refill',
      },
      // Manufacturing goal target: 120, current: 98. Manufacturing Operations category (natural gas).
      {
        department: txMfgDept._id,
        user: adminUser._id,
        emissionFactor: naturalGas._id,
        activityValue: 98 / naturalGas.factor, // 48.04 cubic metres
        carbonEmitted: 98,
        transactionDate: new Date('2026-06-10'),
        description: 'Facility heating & natural gas consumption',
      },
      // Corporate/HR goal target: 80, current: 80. Purchased Electricity category (grid electricity).
      {
        department: hrDept._id,
        user: adminUser._id,
        emissionFactor: gridIN._id,
        activityValue: 80 / gridIN.factor, // 112.99 kWh
        carbonEmitted: 80,
        transactionDate: new Date('2026-04-01'),
        description: 'Office LED lighting upgrade electricity baseline',
      },
      // Other random transactions
      {
        department: txMfgDept._id,
        user: adminUser._id,
        emissionFactor: gridUK._id,
        activityValue: 1200,
        carbonEmitted: 1200 * gridUK.factor,
        transactionDate: new Date(Date.now() - 60 * 24 * 3600 * 1000),
        description: 'Manufacturing facility power usage (2 months ago)',
      },
      {
        department: txItDept._id,
        user: adminUser._id,
        emissionFactor: gridUK._id,
        activityValue: 800,
        carbonEmitted: 800 * gridUK.factor,
        transactionDate: new Date(),
        description: 'Data center electricity consumption (current month)',
      },
    ];
    await CarbonTransaction.insertMany(sampleTransactions);
    console.log(`[SEED] Successfully seeded ${sampleTransactions.length} historical carbon transactions.`);

    // --- Dev A: Environmental Goals ---
    const EnvironmentalGoal = require('../src/models/EnvironmentalGoal');
    await EnvironmentalGoal.deleteMany({});
    const sampleGoals = [
      {
        department: txFleetDept._id,
        category: fleetCat._id,
        targetValue: 500,
        currentValue: 390,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'Active',
      },
      {
        department: txMfgDept._id,
        category: mfgCat._id,
        targetValue: 120,
        currentValue: 98,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-09-30'),
        status: 'Active',
      },
      {
        department: hrDept._id,
        category: emissionCat._id,
        targetValue: 80,
        currentValue: 80,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
        status: 'Achieved',
      },
    ];
    await EnvironmentalGoal.insertMany(sampleGoals);
    console.log(`[SEED] Successfully seeded ${sampleGoals.length} environmental goals.`);

    // --- Dev D: Initial Score Recalculation ---
    const { recalculateDepartmentScore } = require('../src/services/scoring/scoringEngine');
    for (const d of seededDepts) {
      await recalculateDepartmentScore(d._id);
    }
    console.log('[SEED] Recalculated initial ESG scores for all departments.');

    console.log('\x1b[32m[SEED] Database seeding complete!\x1b[0m');
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[SEED ERROR] Seeding failed:\x1b[0m', error.message);
    process.exit(1);
  }
}

seedDatabase();
