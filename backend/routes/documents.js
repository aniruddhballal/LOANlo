const express = require('express');
const LoanApplication = require('../models/LoanApplication');
const Document = require('../models/Document');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType, applicationId } = req.body;

    // Verify application belongs to user
    const application = await LoanApplication.findOne({ 
      _id: applicationId, 
      userId: req.user.userId 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Remove existing document of same type for this application
    await Document.deleteMany({ applicationId, documentType });

    // Save document record
    const document = new Document({
      applicationId,
      userId: req.user.userId,
      documentType,
      fileName: req.file.originalname,
      filePath: req.file.path
    });

    await document.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        documentType: document.documentType,
        fileName: document.fileName,
        uploadedAt: document.uploadedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get uploaded documents for an application
router.get('/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify application belongs to user
    const application = await LoanApplication.findOne({ 
      _id: applicationId, 
      userId: req.user.userId 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const documents = await Document.find({ applicationId });
    const uploadedDocuments = documents.map(doc => doc.documentType);

    res.json({
      success: true,
      uploadedDocuments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete document submission
router.post('/complete/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify application belongs to user
    const application = await LoanApplication.findOne({ 
      _id: applicationId, 
      userId: req.user.userId 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if all required documents are uploaded
    const requiredDocs = ['aadhaar', 'pan', 'salary_slips', 'bank_statements', 'employment_certificate', 'photo'];
    const uploadedDocs = await Document.find({ applicationId });
    const uploadedTypes = uploadedDocs.map(doc => doc.documentType);
    
    const missingDocs = requiredDocs.filter(doc => !uploadedTypes.includes(doc));
    
    if (missingDocs.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required documents', 
        missingDocuments: missingDocs 
      });
    }

    // Update application status
    application.documentsUploaded = true;
    application.status = 'under_review';
    application.statusHistory.push({
      status: 'under_review',
      timestamp: new Date(),
      comment: 'All documents uploaded, application under review'
    });
    application.updatedAt = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Document submission completed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;