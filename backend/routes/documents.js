const express = require('express');
const LoanApplication = require('../models/LoanApplication');
const Document = require('../models/Document');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const fs = require('fs');
const path = require('path');

// Serve/download individual document files
router.get('/file/:applicationId/:documentType', authenticateToken, async (req, res) => {
  try {
    const { applicationId, documentType } = req.params;
    
    // Find the document record
    const document = await Document.findOne({ 
      applicationId, 
      documentType 
    });
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // For admin/reviewer access, skip user ownership check
    // For regular users, verify ownership
    if (req.user.role !== 'underwriter' && req.user.role !== 'system_admin' && req.user.role !== 'admin' && req.user.role !== 'reviewer') {
      const application = await LoanApplication.findOne({
        _id: applicationId,
        userId: req.user.userId
      });
      
      if (!application) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied' 
        });
      }
    }

    // Check if file exists on disk
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found on server' 
      });
    }

    // Get file stats and determine content type
    const fileStat = fs.statSync(document.filePath);
    const fileExtension = path.extname(document.fileName).toLowerCase();
    
    let contentType;
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Set appropriate headers - important for frontend content-type detection
    res.set({
      'Content-Type': contentType,
      'Content-Length': fileStat.size,
      'Content-Disposition': `inline; filename="${document.fileName}"`,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      // Add CORS headers if needed
      'Access-Control-Expose-Headers': 'Content-Type, Content-Length, Content-Disposition'
    });

    // Stream the file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          message: 'Error reading file' 
        });
      }
    });

  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Alternative route for forced download (optional)
router.get('/download/:applicationId/:documentType', authenticateToken, async (req, res) => {
  try {
    const { applicationId, documentType } = req.params;
    
    const document = await Document.findOne({ 
      applicationId, 
      documentType 
    });
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found' 
      });
    }

    // Check authorization - fixed role names to match your system
    if (req.user.role !== 'underwriter' && req.user.role !== 'system_admin' && req.user.role !== 'admin' && req.user.role !== 'reviewer') {
      const application = await LoanApplication.findOne({
        _id: applicationId,
        userId: req.user.userId
      });
      
      if (!application) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied' 
        });
      }
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found on server' 
      });
    }

    // Force download with attachment disposition
    res.download(document.filePath, document.fileName, (error) => {
      if (error) {
        console.error('Error downloading file:', error);
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false, 
            message: 'Error downloading file' 
          });
        }
      }
    });

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType, applicationId } = req.body;

    // Verify application belongs to user (or user has admin rights)
    let application;
    if (req.user.role === 'underwriter' || req.user.role === 'system_admin' || req.user.role === 'admin') {
      application = await LoanApplication.findById(applicationId);
    } else {
      application = await LoanApplication.findOne({ 
        _id: applicationId, 
        userId: req.user.userId 
      });
    }
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Remove existing document of same type for this application
    const existingDoc = await Document.findOne({ applicationId, documentType });
    if (existingDoc && fs.existsSync(existingDoc.filePath)) {
      // Delete the old file from disk
      fs.unlinkSync(existingDoc.filePath);
    }
    await Document.deleteMany({ applicationId, documentType });

    // Save document record
    const document = new Document({
      applicationId,
      userId: application.userId, // Use the application's userId for consistency
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
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get uploaded documents for an application
router.get('/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify application access
    let application;
    if (req.user.role === 'underwriter' || req.user.role === 'system_admin' || req.user.role === 'admin') {
      application = await LoanApplication.findById(applicationId);
    } else {
      application = await LoanApplication.findOne({ 
        _id: applicationId, 
        userId: req.user.userId 
      });
    }
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const documents = await Document.find({ applicationId });
    const uploadedDocuments = documents.map(doc => doc.documentType);

    res.json({
      success: true,
      uploadedDocuments,
      documents: documents.map(doc => ({
        id: doc._id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        uploadedAt: doc.uploadedAt
      }))
    });
  } catch (error) {
    console.error('Get documents error:', error);
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
    console.error('Complete submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;