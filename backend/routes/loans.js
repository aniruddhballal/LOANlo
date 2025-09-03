const express = require('express');
const LoanApplication = require('../models/LoanApplication');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();
const Document = require('../models/Document');

// Helper function to build document requirements with status
const buildDocumentRequirements = (uploadedDocs) => {
  const uploadedDocMap = {};
  uploadedDocs.forEach(doc => {
    uploadedDocMap[doc.documentType] = doc;
  });

  const requirements = [
    {
      name: 'Aadhaar Card',
      type: 'aadhaar',
      required: true,
      description: 'Government issued identity proof with 12-digit unique number'
    },
    {
      name: 'PAN Card',
      type: 'pan',
      required: true,
      description: 'Permanent Account Number card for tax identification'
    },
    {
      name: 'Salary Slips (Last 3 months)',
      type: 'salary_slips',
      required: true,
      description: 'Recent salary certificates showing current income'
    },
    {
      name: 'Bank Statements (Last 6 months)',
      type: 'bank_statements',
      required: true,
      description: 'Bank account statements for financial verification'
    },
    {
      name: 'Employment Certificate',
      type: 'employment_certificate',
      required: true,
      description: 'Letter from employer confirming current employment status'
    },
    {
      name: 'Photo',
      type: 'photo',
      required: true,
      description: 'Recent passport-size photograph for identification'
    },
    {
      name: 'Address Proof',
      type: 'address_proof',
      required: false,
      description: 'Utility bill or rent agreement showing current address'
    },
    {
      name: 'Income Tax Returns',
      type: 'itr',
      required: false,
      description: 'IT returns for additional income verification'
    }
  ];

  return requirements.map(req => ({
    ...req,
    uploaded: !!uploadedDocMap[req.type],
    uploadedAt: uploadedDocMap[req.type]?.uploadedAt
  }));
};

// Submit loan application
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    const { loanType, amount, purpose, tenure } = req.body;
    
    // Get user details to populate applicant name and check profile completion
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'User not found.' 
      });
    }

    // Check if profile is complete
    if (!user.isProfileComplete) {
      return res.status(400).json({ 
        success: false,
        message: 'Please complete your profile before applying for a loan.',
        profileCompletion: user.calculateProfileCompletion()
      });
    }

    const loanApplication = new LoanApplication({
      loanType,
      amount,
      purpose,
      tenure,
      userId: req.user.userId,
      applicantName: `${user.firstName} ${user.lastName}`,
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
      .populate('userId', 'firstName lastName email phone role dateOfBirth gender aadhaarNumber panNumber address city state pincode employmentType companyName monthlyIncome');

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

    // Get uploaded documents for this application
    const uploadedDocs = await Document.find({ applicationId });
    
    // Build document requirements with upload status
    const documentRequirements = buildDocumentRequirements(uploadedDocs);
    
    // Add documents array to application data
    const applicationData = application.toObject();
    applicationData.documents = documentRequirements;

    // Update documentsUploaded flag based on required documents
    const requiredDocs = documentRequirements.filter(doc => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter(doc => doc.uploaded);
    applicationData.documentsUploaded = uploadedRequiredDocs.length === requiredDocs.length;

    res.json({
      success: true,
      application: applicationData
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
    const { status, comment, approvalDetails, rejectionReason, additionalDocumentsRequested } = req.body;
    
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

    // Handle additional documents requested field
    if (additionalDocumentsRequested !== undefined) {
      updateData.additionalDocumentsRequested = additionalDocumentsRequested;
    }

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

// Submit application for review (for applicants)
router.patch('/:applicationId/submit-for-review', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    // Find the application and ensure it belongs to the current user
    const application = await LoanApplication.findOne({
      _id: applicationId,
      userId: req.user.userId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or not authorized'
      });
    }

    // Check if application is in a valid state to be submitted for review
    if (application.status !== 'pending' && application.status !== 'documents_requested') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit application with status "${application.status}" for review`
      });
    }

    // Optional: Check if required documents are uploaded
    const uploadedDocs = await Document.find({ applicationId });
    const documentRequirements = buildDocumentRequirements(uploadedDocs);
    const requiredDocs = documentRequirements.filter(doc => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter(doc => doc.uploaded);
    
    if (uploadedRequiredDocs.length !== requiredDocs.length) {
      return res.status(400).json({
        success: false,
        message: 'Please upload all required documents before submitting for review',
        missingDocuments: requiredDocs.filter(doc => !doc.uploaded).map(doc => doc.name)
      });
    }

    // Add status history entry
    const historyEntry = {
      status: 'under_review',
      timestamp: new Date(),
      comment: 'Application submitted for review by applicant'
    };

    // Update the application status
    const updatedApplication = await LoanApplication.findByIdAndUpdate(
      applicationId,
      {
        status: 'under_review',
        updatedAt: new Date(),
        $push: { statusHistory: historyEntry }
      },
      { new: true }
    ).populate('userId', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Application submitted for review successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error submitting application for review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;