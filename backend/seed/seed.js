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

    // --- Admin User ---
    console.log('[SEED] Seeding Admin User...');
    const hrDept = seededDepts.find(d => d.code === 'HR');
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'admin@gmail.com', // Will be hashed automatically by user model hooks
      role: 'Admin',
      department: hrDept._id,
    });
    console.log(`[SEED] Seeded Admin user: ${adminUser.username} (${adminUser.email})`);

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

    console.log('\x1b[32m[SEED] Database seeding complete!\x1b[0m');
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[SEED ERROR] Seeding failed:\x1b[0m', error.message);
    process.exit(1);
  }
}

seedDatabase();
