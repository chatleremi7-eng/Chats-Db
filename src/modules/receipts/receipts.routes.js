const express = require('express');
const router = express.Router();
const receiptsController = require('./receipts.controller');
const { authenticateToken } = require('../../middleware/auth');

router.post('/:messageId/read', authenticateToken, receiptsController.markRead);
router.get('/:messageId', authenticateToken, receiptsController.getReceipts);

module.exports = router;
