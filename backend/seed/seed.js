const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Department = require('../src/models/Department');
const Category = require('../src/models/Category');

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

    console.log('[SEED] Seeding Departments...');
    const seededDepts = await Department.insertMany(departments);
    console.log(`[SEED] Successfully seeded ${seededDepts.length} departments.`);

    console.log('[SEED] Seeding Categories...');
    const seededCategories = await Category.insertMany(categories);
    console.log(`[SEED] Successfully seeded ${seededCategories.length} categories.`);

    console.log('\x1b[32m[SEED] Database seeding complete!\x1b[0m');
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[SEED ERROR] Seeding failed:\x1b[0m', error.message);
    process.exit(1);
  }
}

seedDatabase();
