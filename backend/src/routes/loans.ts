import { Router, Request, Response } from 'express';
import LoanApplication from '../models/LoanApplication';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import User from '../models/User';
import DocumentModel from '../models/Document';
import underwriterRoutes from './loans/underwriter';
import adminRoutes from './loans/admin';
import { buildDocumentRequirements } from './loans/shared';

import {
  sendLoanApplicationSubmittedEmail,
} from '../utils/loanEmailService';

import { sendApplicationDeletedEmail, sendApplicationDeletedNotificationToUnderwriters } from '../utils/loanEmailService';

const router = Router();

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
          { 
            status: 'pending', 
            timestamp: new Date(), 
            comment: 'Application submitted',
            updatedBy: req.user?.userId.toString() ?? 'Unknown'
          },
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

// Updated soft delete route with email notifications
router.delete(
  '/:applicationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId } = req.params as { applicationId: string };
     
      // Find the application (bypassing the soft delete filter) and populate user data
      const application = await LoanApplication.findOne({
        _id: applicationId,
        userId: req.user?.userId,
        isDeleted: { $ne: true } // Explicitly check it's not already deleted
      }).populate('userId'); // Populate user data for email notifications
     
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
     
      // Get user data for email notifications
      const user = application.userId as any; // Populated user object (IUser)
      const applicantEmail = user.email;
      const applicantFirstName = user.firstName;
      const applicantFullName = `${user.firstName} ${user.lastName}`;
      
      // Store data before deletion for email notifications
      const loanType = application.loanType;
      const amount = application.amount;
      const previousStatus = application.status;
      const deletionTime = new Date();
     
      // Soft delete the application
      application.isDeleted = true;
      application.deletedAt = deletionTime;
      // Add deletion to status history
      application.statusHistory.push({
        status: application.status, // Keep current status
        timestamp: deletionTime,
        comment: 'Application deleted by user'
      });
      await application.save();
     
      // Send email notifications (async, don't block response)
      // 1. Send confirmation email to applicant
      sendApplicationDeletedEmail(
        applicantEmail,
        applicantFirstName,
        applicationId,
        loanType,
        amount,
        deletionTime
      ).catch(err => console.error('Failed to send deletion email to applicant:', err));
     
      // 2. Send notification to underwriters (only if application was in review)
      if (['pending', 'under_review', 'documents_requested'].includes(previousStatus)) {
        sendApplicationDeletedNotificationToUnderwriters(
          applicantFullName,
          applicationId,
          loanType,
          amount,
          previousStatus,
          deletionTime
        ).catch(err => console.error('Failed to send deletion notification to underwriters:', err));
      }
     
      res.json({ success: true, message: 'Application deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// Mount sub-routers without changing urls to keep structure flatter
router.use('/underwriter', underwriterRoutes);
router.use('/admin', adminRoutes);

export default router;