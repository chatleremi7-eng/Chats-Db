const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const messagesService = require('../modules/messages/messages.service');
const receiptsService = require('../modules/receipts/receipts.service');
const db = require('../config/db');

function initSocket(io) {
  // Middleware for Socket.IO JWT authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    jwt.verify(token, jwtConfig.secret, (err, user) => {
      if (err) {
        return next(new Error('Invalid or expired authentication token'));
      }
      socket.user = user;
      next();
    });
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    console.log(`Socket connected: User ${userId} (Socket ID: ${socket.id})`);

    // Update user online status in database
    await db.query('UPDATE users SET is_online = 1 WHERE id = $1', [userId]);
    socket.broadcast.emit('user_status', { userId, isOnline: true });

    // Join room for user's personal updates
    socket.join(`user_${userId}`);

    // Join conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      const room = `conversation_${conversationId}`;
      socket.join(room);
      console.log(`User ${userId} joined room ${room}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      const room = `conversation_${conversationId}`;
      socket.leave(room);
      console.log(`User ${userId} left room ${room}`);
    });

    // Realtime message sending
    socket.on('send_message', async ({ conversationId, content, type, replyToMessageId }, callback) => {
      try {
        const message = await messagesService.sendMessage(userId, {
          conversationId,
          content,
          type,
          replyToMessageId
        });

        // Broadcast to conversation room
        io.to(`conversation_${conversationId}`).emit('new_message', message);

        if (typeof callback === 'function') {
          callback({ status: 'ok', message });
        }
      } catch (err) {
        console.error('Socket send_message error:', err);
        if (typeof callback === 'function') {
          callback({ status: 'error', error: err.message || 'Failed to send message' });
        }
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing_start', {
        conversationId,
        userId,
        username: socket.user.username
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing_stop', {
        conversationId,
        userId
      });
    });

    // Read receipts
    socket.on('mark_read', async ({ messageId, conversationId }) => {
      try {
        const receipt = await receiptsService.markMessageRead(messageId, userId);
        io.to(`conversation_${conversationId}`).emit('message_read', {
          messageId,
          conversationId,
          userId,
          readAt: receipt.read_at
        });
      } catch (err) {
        console.error('Socket mark_read error:', err);
      }
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: User ${userId}`);
      await db.query(
        'UPDATE users SET is_online = 0, last_seen = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
      socket.broadcast.emit('user_status', { userId, isOnline: false, lastSeen: new Date() });
    });
  });
}

module.exports = initSocket;
