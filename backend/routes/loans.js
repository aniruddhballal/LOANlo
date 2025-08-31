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

// Get ALL loan applications (for underwriters only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Only underwriters can access
    if (req.user.role !== 'underwriter') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Underwriter role required.' 
      });
    }

    const applications = await LoanApplication.find({})
      .populate('userId', 'firstName lastName email phone role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching all loan applications:', error);
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

// Get single loan application details (for underwriters and applicants)
router.get('/details/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
   
    const application = await LoanApplication.findById(applicationId)
      .populate('userId', 'firstName lastName email phone role')
      .populate('kycId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Allow underwriters to see any application, applicants can only see their own
    if (req.user.role === 'underwriter') {
      // Underwriters can access any application
    } else if (req.user.role === 'applicant') {
      // Applicants can only access their own applications
      if (application.userId._id.toString() !== req.user.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own applications.'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Unauthorized role.'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update loan application status (for underwriters only)
router.put('/update-status/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, comment, approvalDetails, rejectionReason } = req.body;
    
    // Only underwriters can access
    if (req.user.role !== 'underwriter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Underwriter role required.'
      });
    }

    const application = await LoanApplication.findById(applicationId)
      .populate('userId', 'firstName lastName email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update the application
    const updateData = {
      status,
      updatedAt: new Date()
    };

    // Add status history entry
    const historyEntry = {
      status,
      timestamp: new Date(),
      comment,
      updatedBy: `${req.user.firstName} ${req.user.lastName}` // You might need to get this from user data
    };

    // Handle approval
    if (status === 'approved' && approvalDetails) {
      updateData.approvalDetails = approvalDetails;
    }

    // Handle rejection
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    // Update the application
    const updatedApplication = await LoanApplication.findByIdAndUpdate(
      applicationId,
      {
        ...updateData,
        $push: { statusHistory: historyEntry }
      },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone role');

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add comment to loan application (for underwriters)
router.post('/add-comment/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { comment } = req.body;
    
    // Only underwriters can access
    if (req.user.role !== 'underwriter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Underwriter role required.'
      });
    }

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Add comment to status history without changing status
    const historyEntry = {
      status: application.status, // Keep current status
      timestamp: new Date(),
      comment,
      updatedBy: `${req.user.firstName} ${req.user.lastName}`
    };

    const updatedApplication = await LoanApplication.findByIdAndUpdate(
      applicationId,
      {
        updatedAt: new Date(),
        $push: { statusHistory: historyEntry }
      },
      { new: true }
    ).populate('userId', 'firstName lastName email phone role');

    res.json({
      success: true,
      message: 'Comment added successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Request additional documents (for underwriters)
router.post('/request-documents/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { documentList, message } = req.body;
    
    // Only underwriters can access
    if (req.user.role !== 'underwriter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Underwriter role required.'
      });
    }

    const application = await LoanApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Add document request to status history
    const historyEntry = {
      status: 'documents_requested',
      timestamp: new Date(),
      comment: `Documents requested: ${documentList.join(', ')}. ${message || ''}`,
      updatedBy: `${req.user.firstName} ${req.user.lastName}`
    };

    const updatedApplication = await LoanApplication.findByIdAndUpdate(
      applicationId,
      {
        status: 'documents_requested',
        updatedAt: new Date(),
        documentsUploaded: false, // Reset document status
        $push: { statusHistory: historyEntry }
      },
      { new: true }
    ).populate('userId', 'firstName lastName email phone role');

    // Here you might want to send an email/notification to the user
    // about the document request

    res.json({
      success: true,
      message: 'Document request sent successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error requesting documents:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;