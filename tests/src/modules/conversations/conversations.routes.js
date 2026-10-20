const express = require('express');
const router = express.Router();
const conversationsController = require('./conversations.controller');
const { authenticateToken } = require('../../middleware/auth');

router.post('/', authenticateToken, conversationsController.createConversation);
router.get('/', authenticateToken, conversationsController.getConversations);
router.get('/:id', authenticateToken, conversationsController.getConversation);

module.exports = router;
