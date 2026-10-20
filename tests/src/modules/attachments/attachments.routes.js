const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload');
const attachmentsController = require('./attachments.controller');
const { authenticateToken } = require('../../middleware/auth');

router.post('/upload', authenticateToken, upload.single('file'), attachmentsController.uploadAttachment);

module.exports = router;
