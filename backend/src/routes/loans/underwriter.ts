import { Router, Response } from 'express';
import LoanApplication from '../../models/LoanApplication';
import { AuthenticatedRequest, authenticateToken, requireRole } from '../../middleware/auth';
import RestorationRequest from '../../models/RestorationRequest';
import User, { IUser }from '../../models/User';
import { 
  sendUnderwriterRestorationRequestConfirmation,
  sendUnderwriterRestorationRequestToAdmin,
  sendLoanStatusUpdateEmail,
  sendDocumentsRequestedEmail,
} from '../../utils/loanEmailService';
import { populate } from 'dotenv';

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
        .populate('loanType')
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

      const application = await LoanApplication.findById(applicationId)
        .populate('userId', 'firstName lastName email phone')
        .populate('loanType');

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
        updatedBy: req.user?.userId.toString() ?? 'Unknown'
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
      ).populate('userId', 'firstName lastName email phone role')
      .populate('loanType');

      // Send status update email to applicant
      if (updatedApplication && updatedApplication.userId) {
        const applicant = updatedApplication.userId as any;
        const loanTypeDoc = updatedApplication.loanType as any;
        const loanTypeName = loanTypeDoc?.name || loanTypeDoc?.title || 'Unknown';
        await sendLoanStatusUpdateEmail(
          applicant.email,
          applicant.firstName,
          updatedApplication._id.toString(),
          loanTypeName,
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

      const application = await LoanApplication.findById(applicationId)
      .populate('userId', 'firstName lastName email phone')
      .populate('loanType');

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
      ).populate('userId', 'firstName lastName email phone role')
      .populate('loanType');

      // Send documents requested email to applicant
      if (updatedApplication && updatedApplication.userId) {
        const applicant = updatedApplication.userId as any;

        const loanTypeDoc = updatedApplication.loanType as any;
        const loanTypeName = loanTypeDoc?.name || loanTypeDoc?.title || 'Unknown';

        await sendDocumentsRequestedEmail(
          applicant.email,
          applicant.firstName,
          updatedApplication._id.toString(),
          loanTypeName,
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
      // First, get all non-deleted user IDs
      const activeUsers = await User.find({ isDeleted: { $ne: true } }).select('_id');
      const activeUserIds = activeUsers.map(user => user._id);
      
      // Then query for deleted loan applications with active users only
      const deletedApps = await LoanApplication.find({ 
        isDeleted: true,
        userId: { $in: activeUserIds }
      })
        .populate('userId', 'firstName lastName email phone role')
        .populate('loanType')
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
// Updated route with email notifications
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

      // Find deleted application with populated user data
      const application = await LoanApplication.findOne({
        _id: applicationId,
        isDeleted: true
      }).populate('userId', 'firstName lastName email')
      .populate('loanType');

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

      // Get underwriter details
      const underwriter = await User.findById(req.user.userId);
      if (!underwriter) {
        return res.status(404).json({
          success: false,
          message: 'Underwriter not found'
        });
      }

      // Create restoration request
      const restorationRequest = new RestorationRequest({
        applicationId,
        requestedBy: req.user.userId,
        reason: reason.trim()
      });

      await restorationRequest.save();

      // Prepare data for emails
      const underwriterName = `${underwriter.firstName} ${underwriter.lastName}`;
      const underwriterEmail = underwriter.email;
      
      // Handle populated userId
      const applicant = application.userId as any;
      const applicantName = applicant && applicant.firstName && applicant.lastName
        ? `${applicant.firstName} ${applicant.lastName}`
        : 'Unknown Applicant';

      // Use MongoDB _id directly as the application ID
      const applicationIdStr = application._id.toString();

      // Get deletedAt date, fallback to current date if not set
      const deletedDate = application.deletedAt || new Date();

      const loanTypeDoc = application.loanType as any;
      const loanTypeName = loanTypeDoc?.name || loanTypeDoc?.title || 'Unknown';

      // Send confirmation email to underwriter
      try {
        await sendUnderwriterRestorationRequestConfirmation(
          underwriterEmail,
          underwriterName,
          applicantName,
          applicationIdStr,
          loanTypeName,
          application.amount,
          deletedDate,
          reason.trim()
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email to underwriter:', emailError);
        // Continue execution - email failure shouldn't block the request
      }

      // Send notification to system admin
      try {
        await sendUnderwriterRestorationRequestToAdmin(
          underwriterName,
          underwriterEmail,
          applicantName,
          applicationIdStr,
          loanTypeName,
          application.amount,
          deletedDate,
          reason.trim()
        );
      } catch (emailError) {
        console.error('Failed to send notification email to admin:', emailError);
        // Continue execution - email failure shouldn't block the request
      }

      res.json({
        success: true,
        message: 'Restoration request submitted successfully. You will be notified once the admin reviews your request.',
        request: {
          id: restorationRequest._id,
          applicationId: applicationIdStr,
          status: restorationRequest.status,
          reason: restorationRequest.reason,
          createdAt: restorationRequest.createdAt
        }
      });
    } catch (error: any) {
      console.error('Error in restoration request:', error);
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