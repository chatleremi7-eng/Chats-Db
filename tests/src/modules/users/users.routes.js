const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { authenticateToken } = require('../../middleware/auth');

router.get('/', authenticateToken, usersController.getUsers);
router.patch('/profile', authenticateToken, usersController.updateProfile);

module.exports = router;
