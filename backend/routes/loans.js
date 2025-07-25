const express = require('express');
const LoanApplication = require('../models/LoanApplication');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Submit loan application
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    const loanData = req.body;
    
    const loanApplication = new LoanApplication({
      ...loanData,
      userId: req.user.userId,
      applicantName: `${loanData.firstName} ${loanData.lastName}`,
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
    res.status(500).json({ message: 'Server error', error: error.message });
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

module.exports = router;