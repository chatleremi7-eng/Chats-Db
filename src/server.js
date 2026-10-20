const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const initSocket = require('./sockets/chat.socket');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

initSocket(io);

// Start HTTP & WebSocket Server
server.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(` Sobriva Chat Backend Server running on port ${PORT}`);
  console.log(` REST API: http://localhost:${PORT}/api/health`);
  console.log(` WebSocket: ws://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================`);

  try {
    await db.query('SELECT 1');
    console.log('Database connection verified.');
  } catch (err) {
    console.warn('Database connection warning (ensure PostgreSQL is running):', err.message);
  }
});
