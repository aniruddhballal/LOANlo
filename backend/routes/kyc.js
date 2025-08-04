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

    res.json({ 
      success: true, 
      kyc,
      message: 'KYC details saved successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save KYC', 
      error: err.message 
    });
  }
});

// Get user's KYC details
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const kyc = await UserKYC.findOne({ userId: req.user.userId });
    
    res.json({ 
      success: true,
      kyc 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch KYC', 
      error: err.message 
    });
  }
});

// Optional: Delete KYC details
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const deleted = await UserKYC.findOneAndDelete({ userId: req.user.userId });
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        message: 'KYC details not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'KYC details deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete KYC', 
      error: err.message 
    });
  }
});

module.exports = router;