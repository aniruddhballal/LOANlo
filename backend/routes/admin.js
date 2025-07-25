const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/sync-user-data', authenticateToken, requireRole(['admin']), adminController.syncUserData);

module.exports = router;