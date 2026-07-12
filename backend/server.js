const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve evidence files uploads directory statically
app.use('/uploads', express.static('uploads'));

// DB connection
connectDB();

// ── Routes ────────────────────────────────────────────────────────────────────
// Auth & shared
const authRoutes        = require('./src/routes/auth.routes');
const departmentRoutes  = require('./src/routes/department.routes');

// Dev A — Environmental
const emissionFactorRoutes      = require('./src/routes/emissionFactor.routes');
const carbonTransactionRoutes   = require('./src/routes/carbonTransaction.routes');
const environmentalGoalRoutes   = require('./src/routes/environmentalGoal.routes');

// Dev B — Social & Gamification
const csrActivityRoutes     = require('./src/routes/csrActivity.routes');
const participationRoutes   = require('./src/routes/participation.routes');
const challengeRoutes       = require('./src/routes/challenge.routes');
const badgeRoutes           = require('./src/routes/badge.routes');
const rewardRoutes          = require('./src/routes/reward.routes');
const leaderboardRoutes     = require('./src/routes/leaderboard.routes');

// Dev C — Governance & Notifications
const policyRoutes          = require('./src/routes/policy.routes');
const acknowledgementRoutes = require('./src/routes/acknowledgement.routes');
const auditRoutes           = require('./src/routes/audit.routes');
const complianceIssueRoutes = require('./src/routes/complianceIssue.routes');
const notificationRoutes    = require('./src/routes/notification.routes');

// Dev D — Scoring, Settings & Reports
const scoreRoutes    = require('./src/routes/score.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const reportRoutes   = require('./src/routes/report.routes');

app.use('/api/auth',               authRoutes);
app.use('/api/departments',        departmentRoutes);
app.use('/api/emission-factors',   emissionFactorRoutes);
app.use('/api/carbon-transactions', carbonTransactionRoutes);
app.use('/api/environmental-goals', environmentalGoalRoutes);
app.use('/api/csr-activities',     csrActivityRoutes);
app.use('/api/participation',      participationRoutes);
app.use('/api/challenges',         challengeRoutes);
app.use('/api/badges',             badgeRoutes);
app.use('/api/rewards',            rewardRoutes);
app.use('/api/leaderboard',        leaderboardRoutes);
app.use('/api/policies',           policyRoutes);
app.use('/api/acknowledgements',   acknowledgementRoutes);
app.use('/api/audits',             auditRoutes);
app.use('/api/compliance-issues',  complianceIssueRoutes);
app.use('/api/notifications',      notificationRoutes);
// ✅ Dev D routes
app.use('/api/scores',    scoreRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/api/reports',   reportRoutes);

// Start scheduled jobs (cron)
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

// Mount routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/departments', require('./src/routes/department.routes'));
app.use('/api/categories', require('./src/routes/category.routes'));

// WebSocket Event handler stub
io.on('connection', (socket) => {
  console.log(`[SOCKET] User connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[SOCKET] User disconnected: ${socket.id}`);
  });
});

// Expose Socket.io instance to the request object so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
