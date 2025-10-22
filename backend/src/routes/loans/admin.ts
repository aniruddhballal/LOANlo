import {Router, Response } from 'express';
import LoanApplication from '../../models/LoanApplication';
import { AuthenticatedRequest, authenticateToken, requireRole} from '../../middleware/auth';
import DocumentModel from '../../models/Document';
import RestorationRequest from '../../models/RestorationRequest';
import mongoose from 'mongoose';
import { 
  sendRestorationApprovedEmail,
  sendRestorationRejectedEmail,
  sendApplicationRestoredEmail,
} from '../../utils/loanEmailService';
import User from '../../models/User';

const router = Router();
// Apply middleware to ALL routes
router.use(authenticateToken);
router.use(requireRole('system_admin'));

// 2. Get all restoration requests (system_admin only)
router.get(
  '/restoration-requests',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
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
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Type guard - TypeScript now knows req.user exists below this point
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { requestId } = req.params;
      const { notes } = req.body;

      // Populate the restoration request with underwriter details
      const request = await RestorationRequest.findById(requestId)
        .populate('requestedBy', 'firstName lastName email');

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
        isDeleted: true
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Deleted application not found or already restored'
        });
      }

      // Fetch user separately with error handling
      const applicant = await User.findById(application.userId).select('firstName lastName email');
      const applicantName = applicant?.firstName && applicant?.lastName
        ? `${applicant.firstName} ${applicant.lastName}`
        : 'Unknown Applicant';

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

      await application.save();

      // Update request status
      request.status = 'approved';
      if (mongoose.Types.ObjectId.isValid(req.user.userId)) {
        request.reviewedBy = new mongoose.Types.ObjectId(req.user.userId);
      }
      request.reviewedAt = new Date();
      if (notes) request.reviewNotes = notes.trim();
      
      await request.save();

      // Prepare data for email
      const underwriter = request.requestedBy as any;
      const underwriterName = underwriter && underwriter.firstName && underwriter.lastName
        ? `${underwriter.firstName} ${underwriter.lastName}`
        : 'Underwriter';
      const underwriterEmail = underwriter?.email || '';

      const applicationIdStr = application._id.toString();

      // Send approval email to underwriter
      if (underwriterEmail) {
        try {
          await sendRestorationApprovedEmail(
            underwriterEmail,
            underwriterName,
            applicantName,
            applicationIdStr,
            application.loanType,
            application.amount,
            request.reason,
            notes?.trim()
          );
        } catch (emailError) {
          console.error('Failed to send restoration approved email:', emailError);
          // Continue execution - email failure shouldn't block the approval
        }
      }

      // Send notification email to applicant about restoration
      if (applicant?.email) {
        try {
          await sendApplicationRestoredEmail(
            applicant.email,
            applicantName,
            applicationIdStr,
            application.loanType,
            application.amount,
            request.reason,
            underwriterName
          );
        } catch (emailError) {
          console.error('Failed to send application restored email to applicant:', emailError);
          // Continue execution - email failure shouldn't block the approval
        }
      }

      res.json({
        success: true,
        message: 'Application restored successfully',
        data: {
          applicationId: application._id,
          status: application.status
        }
      });
    } catch (error: any) {
      console.error('Error in restoration approval:', error);
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
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Type guard - TypeScript now knows req.user exists below this point
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
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
      // Populate the restoration request with underwriter details
      const request = await RestorationRequest.findById(requestId)
        .populate('requestedBy', 'firstName lastName email');
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
      // Get application details for email
      const application = await LoanApplication.findOne({
        _id: request.applicationId,
        isDeleted: true
      });
      
      // Update request status
      request.status = 'rejected';
      if (mongoose.Types.ObjectId.isValid(req.user.userId)) {
        request.reviewedBy = new mongoose.Types.ObjectId(req.user.userId);
      }
      request.reviewedAt = new Date();
      request.reviewNotes = notes.trim();
      await request.save();
      // Prepare data for email
      const underwriter = request.requestedBy as any;
      const underwriterName = underwriter && underwriter.firstName && underwriter.lastName
        ? `${underwriter.firstName} ${underwriter.lastName}`
        : 'Underwriter';
      const underwriterEmail = underwriter?.email || '';
      if (application && underwriterEmail) {
        // Fetch user separately with error handling
        const applicant = await User.findById(application.userId).select('firstName lastName email');
        const applicantName = applicant?.firstName && applicant?.lastName
          ? `${applicant.firstName} ${applicant.lastName}`
          : 'Unknown Applicant';
        const applicationIdStr = application._id.toString();
        // Send rejection email to underwriter
        try {
          await sendRestorationRejectedEmail(
            underwriterEmail,
            underwriterName,
            applicantName,
            applicationIdStr,
            application.loanType,
            application.amount,
            request.reason,
            notes.trim()
          );
        } catch (emailError) {
          console.error('Failed to send restoration rejected email:', emailError);
          // Continue execution - email failure shouldn't block the rejection
        }
      }
      res.json({
        success: true,
        message: 'Restoration request rejected'
      });
    } catch (error: any) {
      console.error('Error in restoration rejection:', error);
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
  async (req: AuthenticatedRequest, res: Response) => {
    try {
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
      console.error('Error in permanent deletion:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

export default router;