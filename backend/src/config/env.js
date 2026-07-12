const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file (first search root, then local backend directory)
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config(); // fallback to process.env (Render/Vercel inject vars directly)

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((envVar) => !process.env[envVar]);

if (missingEnv.length > 0) {
  console.error(`\x1b[31m[CONFIG ERROR] Missing required environment variables: ${missingEnv.join(', ')}\x1b[0m`);
  console.error('\x1b[33mPlease check that your .env file or hosting environment variables contain these values.\x1b[0m');
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
