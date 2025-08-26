const express = require('express');
const User = require('../models/User');
const LoanApplication = require('../models/LoanApplication');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Sync all user data across collections (system admin utility route)
router.post('/sync-user-data', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'system_admin') {
      return res.status(403).json({ message: 'System Admin access required' });
    }

    const users = await User.find({});
    let syncedCount = 0;

    for (const user of users) {
      await LoanApplication.updateMany(
        { userId: user._id },
        {
          $set: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            applicantName: `${user.firstName} ${user.lastName}`,
            updatedAt: new Date()
          }
        }
      );
      syncedCount++;
    }

    res.json({
      success: true,
      message: `User data synchronized across all collections for ${syncedCount} users`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;