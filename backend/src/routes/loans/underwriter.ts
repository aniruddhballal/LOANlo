import { Router, Response } from 'express';
import LoanApplication from '../../models/LoanApplication';
import { AuthenticatedRequest, authenticateToken, requireRole } from '../../middleware/auth';
import RestorationRequest from '../../models/RestorationRequest';

import {
  sendLoanStatusUpdateEmail,
  sendDocumentsRequestedEmail,
} from '../../utils/loanEmailService';

const router = Router();
router.use(authenticateToken);
router.use(requireRole('underwriter'));

// Get ALL loan applications (for underwriters only)
router.get(
  '/all',
  async (req: AuthenticatedRequest, res: Response) => {
    try {

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

// Update loan application status (for underwriters only)
router.put(
  '/update-status/:applicationId',
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
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId } = req.params as { applicationId: string };
      const { documentList, message } = req.body as { documentList: string[]; message?: string };

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

// Get deleted loan applications (for underwriters only)
router.get(
  '/deleted',
  async (req: AuthenticatedRequest, res: Response) => {
    try {

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

// 1. Request restoration (underwriters only)
router.post(
  '/request-restoration/:applicationId',
  async (req: AuthenticatedRequest, res: Response) => {
    try {

      // Type guard - TypeScript now knows req.user exists below this point
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
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

// Get my restoration requests (underwriter only)
router.get(
  '/my-restoration-requests',
  async (req: AuthenticatedRequest, res: Response) => {
    try {

      // Type guard - TypeScript now knows req.user exists below this point
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
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