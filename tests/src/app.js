const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const conversationsRoutes = require('./modules/conversations/conversations.routes');
const messagesRoutes = require('./modules/messages/messages.routes');
const attachmentsRoutes = require('./modules/attachments/attachments.routes');
const receiptsRoutes = require('./modules/receipts/receipts.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security & Utility Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static File Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/attachments', attachmentsRoutes);
app.use('/api/receipts', receiptsRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), service: 'Sobriva Realtime Chat Backend' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
