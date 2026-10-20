const express = require('express');
const router = express.Router();
const messagesController = require('./messages.controller');
const { authenticateToken } = require('../../middleware/auth');

router.post('/', authenticateToken, messagesController.sendMessage);
router.get('/conversation/:conversationId', authenticateToken, messagesController.getMessages);

module.exports = router;
