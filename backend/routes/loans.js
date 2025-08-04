const express = require('express');
const LoanApplication = require('../models/LoanApplication');
const { authenticateToken } = require('../middleware/auth');
const UserKYC = require('../models/UserKYC');
const router = express.Router();

// Submit loan application
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    const { loanType, amount, purpose, tenure } = req.body;
    
    // Get user's KYC details to populate applicant name
    const userKYC = await UserKYC.findOne({ userId: req.user.userId });
    
    if (!userKYC) {
      return res.status(400).json({ 
        success: false,
        message: 'KYC details not found. Please complete KYC first.' 
      });
    }

    const loanApplication = new LoanApplication({
      loanType,
      amount,
      purpose,
      tenure,
      userId: req.user.userId,
      applicantName: `${userKYC.firstName} ${userKYC.lastName}`,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        comment: 'Application submitted'
      }]
    });

    await loanApplication.save();

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      applicationId: loanApplication._id
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get user's loan applications with populated user data
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const applications = await LoanApplication.find({ userId: req.user.userId })
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single loan application with populated user data
router.get('/application/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
   
    const application = await LoanApplication.findOne({
      _id: applicationId,
      userId: req.user.userId
    }).populate('userId', 'firstName lastName email phone');
   
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a loan application
router.delete('/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Only allow the owner to delete their application
    const deleted = await LoanApplication.findOneAndDelete({
      _id: applicationId,
      userId: req.user.userId
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Application not found or not authorized' });
    }

    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;