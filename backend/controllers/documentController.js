const Document = require('../models/Document');
const LoanApplication = require('../models/LoanApplication');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHelper');
const { REQUIRED_DOCUMENTS } = require('../utils/constants');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return sendErrorResponse(res, 400, 'No file uploaded');
    }

    const { documentType, applicationId } = req.body;

    // Verify application belongs to user
    const application = await LoanApplication.findOne({ 
      _id: applicationId, 
      userId: req.user.userId 
    });
    
    if (!application) {
      return sendErrorResponse(res, 404, 'Application not found');
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

    sendSuccessResponse(res, 200, 'Document uploaded successfully', {
      document: {
        id: document._id,
        documentType: document.documentType,
        fileName: document.fileName,
        uploadedAt: document.uploadedAt
      }
    });
  } catch (error) {
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

const getDocuments = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify application belongs to user
    const application = await LoanApplication.findOne({ 
      _id: applicationId, 
      userId: req.user.userId 
    });
    
    if (!application) {
      return sendErrorResponse(res, 404, 'Application not found');
    }

    const documents = await Document.find({ applicationId });
    const uploadedDocuments = documents.map(doc => doc.documentType);

    sendSuccessResponse(res, 200, 'Documents retrieved successfully', {
      uploadedDocuments
    });
  } catch (error) {
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

const completeDocumentSubmission = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify application belongs to user
    const application = await LoanApplication.findOne({ 
      _id: applicationId, 
      userId: req.user.userId 
    });
    
    if (!application) {
      return sendErrorResponse(res, 404, 'Application not found');
    }

    // Check if all required documents are uploaded
    const uploadedDocs = await Document.find({ applicationId });
    const uploadedTypes = uploadedDocs.map(doc => doc.documentType);
    
    const missingDocs = REQUIRED_DOCUMENTS.filter(doc => !uploadedTypes.includes(doc));
    
    if (missingDocs.length > 0) {
      return sendErrorResponse(res, 400, 'Missing required documents', {
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

    sendSuccessResponse(res, 200, 'Document submission completed successfully');
  } catch (error) {
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  completeDocumentSubmission
};