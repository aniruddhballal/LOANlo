import { Router, Request, Response } from 'express';
import LoanApplication from '../models/LoanApplication';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import User from '../models/User';
import DocumentModel, { IDocument, DocumentType } from '../models/Document';
import RestorationRequest from '../models/RestorationRequest';
import mongoose from 'mongoose';

import {
  sendLoanApplicationSubmittedEmail,
  sendLoanStatusUpdateEmail,
  sendDocumentsRequestedEmail,
} from '../utils/loanEmailService';

const router = Router();

// Type for document requirement objects
interface DocumentRequirement {
  name: string;
  type: DocumentType;
  required: boolean;
  description: string;
  uploaded?: boolean;
  uploadedAt?: Date | undefined;
}

const buildDocumentRequirements = (uploadedDocs: IDocument[]): DocumentRequirement[] => {
  // Use Partial<Record<...>> so TS knows keys may be missing
  const uploadedDocMap: Partial<Record<DocumentType, IDocument>> = {};

  uploadedDocs.forEach((doc) => {
    // Assert doc.documentType as DocumentType for safe indexing
    uploadedDocMap[doc.documentType as DocumentType] = doc;
  });

  const requirements: DocumentRequirement[] = [
    {
      name: 'Aadhaar Card',
      type: 'aadhaar',
      required: true,
      description: 'Government issued identity proof with 12-digit unique number',
    },
    {
      name: 'PAN Card',
      type: 'pan',
      required: true,
      description: 'Permanent Account Number card for tax identification',
    },
    {
      name: 'Salary Slips (Last 3 months)',
      type: 'salary_slips',
      required: true,
      description: 'Recent salary certificates showing current income',
    },
    {
      name: 'Bank Statements (Last 6 months)',
      type: 'bank_statements',
      required: true,
      description: 'Bank account statements for financial verification',
    },
    {
      name: 'Employment Certificate',
      type: 'employment_certificate',
      required: true,
      description: 'Letter from employer confirming current employment status',
    },
    {
      name: 'Photo',
      type: 'photo',
      required: true,
      description: 'Recent passport-size photograph for identification',
    },
    {
      name: 'Address Proof',
      type: 'address_proof',
      required: false,
      description: 'Utility bill or rent agreement showing current address',
    },
    {
      name: 'Income Tax Returns',
      type: 'itr',
      required: false,
      description: 'IT returns for additional income verification',
    },
  ];

  return requirements.map((req) => ({
    ...req,
    uploaded: !!uploadedDocMap[req.type],
    uploadedAt: uploadedDocMap[req.type]?.uploadedAt,
  }));
};

router.post(
  '/apply',
  authenticateToken,
  async (
    req: Request<{}, {}, { loanType: string; amount: number; purpose: string; tenure: number }> & { user?: any }, 
    res: Response
  ) => {
    try {
      const { loanType, amount, purpose, tenure } = req.body;

      const user = await User.findById(req.user?.userId);
      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found.' });
      }

      if (!user.isProfileComplete) {
        return res.status(400).json({
          success: false,
          message: 'Please complete your profile before applying for a loan.',
          profileCompletion: user.calculateProfileCompletion(),
        });
      }

      const loanApplication = new LoanApplication({
        loanType,
        amount,
        purpose,
        tenure,
        userId: req.user?.userId,
        statusHistory: [
          { status: 'pending', timestamp: new Date(), comment: 'Application submitted' },
        ],
      });

      await loanApplication.save();

      // Send confirmation email to applicant
      await sendLoanApplicationSubmittedEmail(
        user.email,
        user.firstName,
        loanApplication._id.toString(),
        loanType,
        amount
      );

      res.status(201).json({ 
        success: true, 
        message: 'Loan application submitted successfully', 
        applicationId: loanApplication._id 
      });

    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// Get ALL loan applications (for underwriters only)
router.get(
  '/all',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Only underwriters can access
      if (req.user?.role !== 'underwriter') {
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// Get user's loan applications with populated user data
router.get(
  '/my-applications',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const applications = await LoanApplication.find({ userId: req.user?.userId })
        .populate('userId', 'firstName lastName email phone')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        applications
      });
    } catch (error: any) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// Soft delete a loan application
router.delete(
  '/:applicationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId } = req.params as { applicationId: string };
      
      // Find the application (bypassing the soft delete filter)
      const application = await LoanApplication.findOne({
        _id: applicationId,
        userId: req.user?.userId,
        isDeleted: { $ne: true } // Explicitly check it's not already deleted
      });
      
      if (!application) {
        return res.status(404).json({
          message: 'Application not found or not authorized'
        });
      }
      
      // Prevent deletion of approved applications
      if (application.status === 'approved') {
        return res.status(400).json({
          message: 'Cannot delete approved applications'
        });
      }
      
      // Soft delete the application
      application.isDeleted = true;
      application.deletedAt = new Date();
      await application.save();
      
      res.json({ success: true, message: 'Application deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Get deleted loan applications (for underwriters only)
router.get(
  '/deleted',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.role !== 'underwriter') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Underwriter role required.'
        });
      }

      const deletedApps = await LoanApplication.find({ isDeleted: true })
        .populate('userId', 'firstName lastName email phone role')
        .sort({ deletedAt: -1 });

      res.json({
        success: true,
        applications: deletedApps
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// Get single loan application details (for underwriters and applicants)
router.get(
  '/details/:applicationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId } = req.params as { applicationId: string };

      const application = await LoanApplication.findById(applicationId)
        .populate(
          'userId',
          'firstName lastName email phone role dateOfBirth gender aadhaarNumber panNumber address city state pincode employmentType companyName monthlyIncome'
        );

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Access control
      if (req.user?.role === 'underwriter') {
        // underwriters can access any
      } else if (req.user?.role === 'applicant') {
        if (application.userId._id.toString() !== req.user.userId?.toString()) {
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

      const uploadedDocs = await DocumentModel.find({ applicationId });

      const documentRequirements = buildDocumentRequirements(uploadedDocs);

      const applicationData = application.toObject() as any;
      applicationData.documents = documentRequirements;

      const requiredDocs = documentRequirements.filter(doc => doc.required);
      const uploadedRequiredDocs = requiredDocs.filter(doc => doc.uploaded);
      applicationData.documentsUploaded = uploadedRequiredDocs.length === requiredDocs.length;

      res.json({
        success: true,
        application: applicationData
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// Update loan application status (for underwriters only)
router.put(
  '/update-status/:applicationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId } = req.params as { applicationId: string };
      const {
        status,
        comment,
        approvalDetails,
        rejectionReason,
        additionalDocumentsRequested
      } = req.body as {
        status: string;
        comment?: string;
        approvalDetails?: any;
        rejectionReason?: string;
        additionalDocumentsRequested?: boolean;
      };

      // Only underwriters can access
      if (req.user?.role !== 'underwriter') {
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

      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (additionalDocumentsRequested !== undefined) {
        updateData.additionalDocumentsRequested = additionalDocumentsRequested;
      }

      const historyEntry: any = {
        status,
        timestamp: new Date(),
        comment,
        updatedBy: `${req.user?.firstName ?? 'Unknown'} ${req.user?.lastName ?? ''}`
      };

      if (status === 'approved' && approvalDetails) {
        updateData.approvalDetails = approvalDetails;
      }

      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      const updatedApplication = await LoanApplication.findByIdAndUpdate(
        applicationId,
        {
          ...updateData,
          $push: { statusHistory: historyEntry }
        },
        { new: true, runValidators: true }
      ).populate('userId', 'firstName lastName email phone role');

      // Send status update email to applicant
      if (updatedApplication && updatedApplication.userId) {
        const applicant = updatedApplication.userId as any;
        await sendLoanStatusUpdateEmail(
          applicant.email,
          applicant.firstName,
          updatedApplication._id.toString(),
          updatedApplication.loanType,
          updatedApplication.amount,
          status,
          comment,
          rejectionReason,
          approvalDetails
        );
      }

      res.json({
        success: true,
        message: `Application ${status} successfully`,
        application: updatedApplication
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// Request additional documents (for underwriters) - unused right now
router.post(
  '/request-documents/:applicationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId } = req.params as { applicationId: string };
      const { documentList, message } = req.body as { documentList: string[]; message?: string };

      // Only underwriters can access
      if (req.user?.role !== 'underwriter') {
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
      const historyEntry: any = {
        status: 'documents_requested',
        timestamp: new Date(),
        comment: `Documents requested: ${documentList.join(', ')}. ${message || ''}`,
        updatedBy: `${req.user?.firstName ?? 'Unknown'} ${req.user?.lastName ?? ''}`
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

      // Send documents requested email to applicant
      if (updatedApplication && updatedApplication.userId) {
        const applicant = updatedApplication.userId as any;
        await sendDocumentsRequestedEmail(
          applicant.email,
          applicant.firstName,
          updatedApplication._id.toString(),
          updatedApplication.loanType,
          message
        );
      }

      res.json({
        success: true,
        message: 'Document request sent successfully',
        application: updatedApplication
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// 1. Request restoration (underwriters only)
router.post(
  '/request-restoration/:applicationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.role !== 'underwriter') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Underwriter role required.'
        });
      }

      const { applicationId } = req.params as { applicationId: string };
      const { reason } = req.body;

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Restoration reason must be at least 10 characters'
        });
      }

      // Find deleted application
      const application = await LoanApplication.findOne({
        _id: applicationId,
        isDeleted: true
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Deleted application not found'
        });
      }

      // Check if there's already a pending request for this application
      const existingRequest = await RestorationRequest.findOne({
        applicationId,
        status: 'pending'
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'A restoration request is already pending for this application'
        });
      }

      // Create restoration request
      const restorationRequest = new RestorationRequest({
        applicationId,
        requestedBy: req.user.userId,
        reason: reason.trim()
      });

      await restorationRequest.save();

      res.json({
        success: true,
        message: 'Restoration request submitted successfully',
        request: restorationRequest
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// 2. Get all restoration requests (system_admin only)
router.get(
  '/restoration-requests',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.role !== 'system_admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. System admin role required.'
        });
      }
      const { status } = req.query;
      const filter: any = {};
     
      if (status && status !== 'all') {
        filter.status = status;
      }
      // First, get restoration requests with basic population
      const requests = await RestorationRequest.find(filter)
        .populate('requestedBy', 'firstName lastName email role')
        .populate('reviewedBy', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .lean(); // Use lean() for better performance

      // Manually populate applicationId including soft-deleted ones
      const populatedRequests = await Promise.all(
        requests.map(async (request) => {
          // Find the application WITHOUT the soft-delete filter by explicitly querying with isDeleted
          const application = await LoanApplication.findOne({
            _id: request.applicationId,
            isDeleted: { $in: [true, false] } // This forces the query to include both deleted and non-deleted
          })
          .populate('userId', 'firstName lastName email phone')
          .lean();

          return {
            ...request,
            applicationId: application
          };
        })
      );
      
      res.json({
        success: true,
        requests: populatedRequests
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// 3. Approve restoration request (system_admin only)
router.post(
  '/restoration-requests/:requestId/approve',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.role !== 'system_admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. System admin role required.'
        });
      }

      const { requestId } = req.params;
      const { notes } = req.body;

      const request = await RestorationRequest.findById(requestId);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Restoration request not found'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'This request has already been reviewed'
        });
      }

      // CRITICAL FIX: Explicitly query for deleted applications
      const application = await LoanApplication.findOne({
        _id: request.applicationId,
        isDeleted: true  // Only find if actually deleted
      });
     
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Deleted application not found or already restored'
        });
      }

      // Business rule validation (customize as needed)
      if (application.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Cannot restore approved applications. Please contact compliance.'
        });
      }

      // Restore the application with audit trail
      application.isDeleted = false;
      application.deletedAt = undefined;
      
      // Add restoration to status history
      application.statusHistory.push({
        status: application.status, // Keep current status
        timestamp: new Date(),
        comment: `Application restored by system admin. Reason: ${request.reason}`,
        updatedBy: req.user.userId
      });
      

      // Update request status
      request.status = 'approved';
      if (mongoose.Types.ObjectId.isValid(req.user.userId)) {
        request.reviewedBy = new mongoose.Types.ObjectId(req.user.userId);
      }
      request.reviewedAt = new Date();
      if (notes) request.reviewNotes = notes.trim();
      

      res.json({
        success: true,
        message: 'Application restored successfully',
        data: {
          applicationId: application._id,
          status: application.status
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// 4. Reject restoration request (system_admin only)
router.post(
  '/restoration-requests/:requestId/reject',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.role !== 'system_admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. System admin role required.'
        });
      }

      const { requestId } = req.params;
      const { notes } = req.body;

      if (!notes || notes.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      const request = await RestorationRequest.findById(requestId);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Restoration request not found'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'This request has already been reviewed'
        });
      }

      // Update request status
      request.status = 'rejected';
      if (mongoose.Types.ObjectId.isValid(req.user.userId)) {
        request.reviewedBy = new mongoose.Types.ObjectId(req.user.userId);
      }
      request.reviewedAt = new Date();
      request.reviewNotes = notes.trim();
      await request.save();

      res.json({
        success: true,
        message: 'Restoration request rejected'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// 5. Permanently delete application (system_admin only)
router.delete(
  '/permanent-delete/:applicationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.role !== 'system_admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. System admin role required.'
        });
      }

      const { applicationId } = req.params as { applicationId: string };

      // Find deleted application
      const application = await LoanApplication.findOne({
        _id: applicationId,
        isDeleted: true
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Deleted application not found'
        });
      }

      // Permanently delete the application and related data
      await LoanApplication.findByIdAndDelete(applicationId);
      
      // Also delete any related documents
      await DocumentModel.deleteMany({ applicationId });
      
      // Delete any restoration requests for this application
      await RestorationRequest.deleteMany({ applicationId });

      res.json({
        success: true,
        message: 'Application permanently deleted'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// Get my restoration requests (underwriter only)
router.get(
  '/my-restoration-requests',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.role !== 'underwriter') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Underwriter role required.'
        });
      }

      const requests = await RestorationRequest.find({ 
        requestedBy: req.user.userId 
      })
        .select('applicationId status createdAt')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        requests
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

export default router;