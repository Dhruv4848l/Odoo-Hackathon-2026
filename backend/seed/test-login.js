const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const User = require('../src/models/User');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const user = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    if (!user) {
      console.log('FAIL: User admin@gmail.com not found in the DB!');
      process.exit(1);
    }

    console.log('Found user in DB:', user.username);
    console.log('Hashed Password in DB:', user.password);

    const isMatch = await user.comparePassword('admin@gmail.com');
    console.log('Password Match Result:', isMatch ? 'PASS' : 'FAIL');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
