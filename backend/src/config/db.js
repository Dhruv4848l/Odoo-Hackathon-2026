const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true, // Build indexes at startup for schema validations
    });
    
    console.log(`\x1b[32m[DATABASE] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}\x1b[0m`);
    return conn;
  } catch (error) {
    console.error(`\x1b[31m[DATABASE ERROR] Connection failed: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

module.exports = connectDB;
