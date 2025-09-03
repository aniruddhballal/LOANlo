const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Changed from UserKYC to User
const { authenticateToken } = require('../middleware/auth');

// Save or update KYC details
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Extract KYC fields from request body (excluding sensitive fields)
    const {
      firstName, lastName, dateOfBirth, gender, maritalStatus,
      aadhaarNumber, panNumber, phone, address, city, state, pincode,
      employmentType, companyName, designation, workExperience, monthlyIncome
    } = req.body;
    
    const kycUpdateData = {
      firstName, lastName, dateOfBirth, gender, maritalStatus,
      aadhaarNumber, panNumber, phone, address, city, state, pincode,
      employmentType, companyName, designation, workExperience, monthlyIncome
    };
    
    // Remove undefined fields
    Object.keys(kycUpdateData).forEach(key => 
      kycUpdateData[key] === undefined && delete kycUpdateData[key]
    );
    
    // Update the user document with KYC data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      kycUpdateData,
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from response
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: updatedUser,
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
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC',
      error: err.message
    });
  }
});

// Clear KYC details (set KYC fields to null/undefined)
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const kycFields = {
      dateOfBirth: null,
      gender: null,
      maritalStatus: null,
      aadhaarNumber: null,
      panNumber: null,
      address: null,
      city: null,
      state: null,
      pincode: null,
      employmentType: null,
      companyName: null,
      designation: null,
      workExperience: null,
      monthlyIncome: null
    };
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      kycFields,
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'KYC details cleared successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear KYC',
      error: err.message
    });
  }
});

module.exports = router;