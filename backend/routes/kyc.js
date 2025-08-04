const express = require('express');
const router = express.Router();
const UserKYC = require('../models/UserKYC');
const { authenticateToken } = require('../middleware/auth');

// Save or update KYC details
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const kycData = { ...req.body, userId };

    // Upsert: update if exists, else create
    const kyc = await UserKYC.findOneAndUpdate(
      { userId },
      kycData,
      { upsert: true, new: true }
    );

    res.json({ success: true, kyc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save KYC', error: err.message });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const kyc = await UserKYC.findOne({ userId: req.user.userId });
    res.json({ kyc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch KYC', error: err.message });
  }
});

module.exports = router;