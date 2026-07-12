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

// Basic health check route
app.use('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date(),
    database: ['disconnected', 'connected', 'connecting', 'disconnecting'][require('mongoose').connection.readyState],
  });
});

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
