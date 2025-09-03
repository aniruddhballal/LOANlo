const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Save or update profile details
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Extract profile fields from request body
    const {
      firstName, lastName, dateOfBirth, gender, maritalStatus,
      aadhaarNumber, panNumber, phone, address, city, state, pincode,
      employmentType, companyName, designation, workExperience, monthlyIncome
    } = req.body;

    const profileUpdateData = {
      firstName, lastName, dateOfBirth, gender, maritalStatus,
      aadhaarNumber, panNumber, phone, address, city, state, pincode,
      employmentType, companyName, designation, workExperience, monthlyIncome
    };

    // Remove undefined fields
    Object.keys(profileUpdateData).forEach(
      key => profileUpdateData[key] === undefined && delete profileUpdateData[key]
    );

    // Update the user document with profile data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      profileUpdateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile details saved successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to save profile details',
      error: err.message
    });
  }
});

// Get user's profile details
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
      message: 'Failed to fetch profile details',
      error: err.message
    });
  }
});

// Clear profile details (set profile fields to null/undefined)
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const profileFields = {
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
      profileFields,
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
      message: 'Profile details cleared successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear profile details',
      error: err.message
    });
  }
});

module.exports = router;