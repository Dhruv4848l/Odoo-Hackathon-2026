const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Parse allowed origins (supports comma-separated list for multiple frontends)
const allowedOrigins = env.CLIENT_URL.split(',').map(u => u.trim());

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all in hackathon context
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve evidence files uploads directory statically
app.use('/uploads', express.static(uploadsDir));

// DB connection
connectDB();

// Initialize cron jobs
require('./src/jobs/cron');

// Basic health check route
app.use('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date(),
    database: ['disconnected', 'connected', 'connecting', 'disconnecting'][require('mongoose').connection.readyState],
  });
});

// WebSocket Event handler (Governance real-time & notifications)
const socketHandler = require('./src/sockets/index');
socketHandler(io);

// Expose Socket.io instance to the request object so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────────────────────

// Auth & Core (Dev A)
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/departments', require('./src/routes/department.routes'));
app.use('/api/categories', require('./src/routes/category.routes'));

// Environmental Module (Dev A)
app.use('/api/emission-factors', require('./src/routes/emissionFactor.routes'));
app.use('/api/carbon-transactions', require('./src/routes/carbonTransaction.routes'));
app.use('/api/environmental-goals', require('./src/routes/environmentalGoal.routes'));
app.use('/api/product-esg-profiles', require('./src/routes/productESGProfile.routes'));

// Social & Gamification (Dev B)
app.use('/api/csr-activities', require('./src/routes/csrActivity.routes'));
app.use('/api/participation', require('./src/routes/participation.routes'));
app.use('/api/challenges', require('./src/routes/challenge.routes'));
app.use('/api/badges', require('./src/routes/badge.routes'));
app.use('/api/rewards', require('./src/routes/reward.routes'));
app.use('/api/leaderboard', require('./src/routes/leaderboard.routes'));

// Governance Module (Dev C)
app.use('/api/policies', require('./src/routes/policy.routes'));
app.use('/api/acknowledgements', require('./src/routes/acknowledgement.routes'));
app.use('/api/audits', require('./src/routes/audit.routes'));
app.use('/api/compliance-issues', require('./src/routes/complianceIssue.routes'));
app.use('/api/notifications', require('./src/routes/notification.routes'));

// Scoring & Reports (Dev D)
app.use('/api/scores', require('./src/routes/score.routes'));
app.use('/api/settings', require('./src/routes/settings.routes'));
app.use('/api/reports', require('./src/routes/report.routes'));

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('\x1b[31m[SERVER ERROR]\x1b[0m', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start listening
server.listen(env.PORT, () => {
  console.log(`\x1b[36m[SERVER] Server running in ${env.NODE_ENV} mode on port ${env.PORT}\x1b[0m`);
});

module.exports = { app, server, io };
