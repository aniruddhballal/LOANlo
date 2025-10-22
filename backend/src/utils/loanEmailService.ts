import sgMail from '@sendgrid/mail';
import { loanApplicationSubmittedTemplate, LoanApplicationSubmittedData } from './LoanApplicationSubmittedData';
import { loanStatusUpdateTemplate, LoanStatusUpdateData } from './loanStatusUpdateTemplate';
import { newApplicationNotificationTemplate, NewApplicationNotificationData } from './newApplicationNotificationTemplate';
import { documentsRequestedTemplate, DocumentsRequestedData } from './documentsRequestedTemplate';
import { 
  applicationDeletedTemplate, 
  ApplicationDeletedData,
  applicationDeletedUnderwriterTemplate,
  ApplicationDeletedUnderwriterData
} from './applicationDeletedTemplate';
import { 
  underwriterRestorationRequestConfirmationTemplate, 
  UnderwriterRestorationRequestConfirmationData,
  underwriterRestorationRequestAdminTemplate,
  UnderwriterRestorationRequestAdminData
} from './underwriterRestorationRequestTemplate';
import { 
  restorationApprovedTemplate, 
  RestorationApprovedData,
  restorationRejectedTemplate,
  RestorationRejectedData
} from './restorationResponseTemplates';
import { 
  applicationRestoredTemplate, 
  ApplicationRestoredData 
} from './applicationRestoredTemplate';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const getFrontendUrl = () => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
  if (process.env.NODE_ENV === 'production') {
    return allowedOrigins.find(origin => !origin.includes('localhost')) || allowedOrigins[0];
  }
  return allowedOrigins.find(origin => origin.includes('localhost')) || allowedOrigins[0];
};

/**
 * Send email to applicant when they submit a new loan application
 */
export const sendLoanApplicationSubmittedEmail = async (
  email: string,
  firstName: string,
  applicationId: string,
  loanType: string,
  amount: number,
) => {

  try {
    const frontendUrl = getFrontendUrl();
    const applicationStatusLink = `${frontendUrl}/application-status`;

    const emailData: LoanApplicationSubmittedData = {
      firstName,
      applicationId,
      loanType,
      amount,
      applicationStatusLink: applicationStatusLink,
    };

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: `Loan Application Received - ${applicationId}`,
      html: loanApplicationSubmittedTemplate(emailData),
      text: `Dear ${firstName},\n\nYour loan application (ID: ${applicationId}) has been received successfully. You can track its status in your dashboard: ${applicationStatusLink}\n\nLOANLO Team`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending application submitted email:', error);
    // Don't throw - we don't want email failures to break the application flow
  }
};

/**
 * Send email to applicant when loan status changes
 */
export const sendLoanStatusUpdateEmail = async (
  email: string,
  firstName: string,
  applicationId: string,
  loanType: string,
  amount: number,
  status: string,
  comment?: string,
  rejectionReason?: string,
  approvalDetails?: {
    approvedAmount?: number;
    interestRate?: number;
    tenure?: number;
  }
) => {
  try {
    const frontendUrl = getFrontendUrl();
    const applicationStatusLink = `${frontendUrl}/application-status`;
    

    const emailData: LoanStatusUpdateData = {
      firstName,
      applicationId,
      loanType,
      amount,
      status,
      comment,
      rejectionReason,
      approvalDetails,
      applicationStatusLink: applicationStatusLink,
    };

    const statusText = status.replace(/_/g, ' ').toUpperCase();
    
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: `Loan Application ${statusText} - ${applicationId}`,
      html: loanStatusUpdateTemplate(emailData),
      text: `Dear ${firstName},\n\nYour loan application status has been updated to: ${statusText}\n\nApplication ID: ${applicationId}\nView details: ${applicationStatusLink}\n\nLOANLO Team`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending status update email:', error);
  }
};

/**
 * Send email to underwriters when a new application is submitted for review
 */
export const sendNewApplicationNotificationToUnderwriters = async (
  applicantName: string,
  applicationId: string,
  loanType: string,
  amount: number
) => {
  try {
    // Get all underwriter emails from environment variable
    const underwriterEmails = (process.env.UNDERWRITER_EMAILS || '')
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (underwriterEmails.length === 0) {
      console.warn('⚠️ No underwriter emails configured in UNDERWRITER_EMAILS');
      return;
    }

    const frontendUrl = getFrontendUrl();
    const underwriterDashboardLink = `${frontendUrl}/dashboard/underwriter`;

    // Send to all underwriters
    const emailPromises = underwriterEmails.map(async (underwriterEmail) => {
      // Extract first name from email (basic implementation)
      const underwriterName = (underwriterEmail.split('@')[0] || 'Underwriter')
        .split('.')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const emailData: NewApplicationNotificationData = {
        underwriterName,
        applicantName,
        applicationId,
        loanType,
        amount,
        underwriterDashboardLink: underwriterDashboardLink,
      };

      const msg = {
        to: underwriterEmail,
        from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
        subject: `New Loan Application for Review - ${applicationId}`,
        html: newApplicationNotificationTemplate(emailData),
        text: `Dear ${underwriterName},\n\nA new loan application has been submitted for review.\n\nApplicant: ${applicantName}\nApplication ID: ${applicationId}\nLoan Type: ${loanType}\n\nReview now: ${underwriterDashboardLink}\n\nLOANLO Team`,
      };

      return sgMail.send(msg);
    });

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('❌ Error sending underwriter notification emails:', error);
  }
};

/**
 * Send email to applicant when additional documents are requested
 */
export const sendDocumentsRequestedEmail = async (
  email: string,
  firstName: string,
  applicationId: string,
  loanType: string,
  comment?: string
) => {
  try {
    const frontendUrl = getFrontendUrl();
    const applicationStatusLink = `${frontendUrl}/application-status`;

    const emailData: DocumentsRequestedData = {
    firstName,
    applicationId,
    loanType,
    ...(comment !== undefined && { comment }),
    applicationStatusLink: applicationStatusLink,
    };

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: `Additional Documents Required - ${applicationId}`,
      html: documentsRequestedTemplate(emailData),
      text: `Dear ${firstName},\n\nAdditional documents are required for your loan application (ID: ${applicationId}).\n\n${comment ? `Note: ${comment}\n\n` : ''}Please upload the documents in your dashboard: ${applicationStatusLink}\n\nLOANLO Team`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending documents requested email:', error);
  }
};

/**
 * Send email to applicant when they delete their loan application
 */
export const sendApplicationDeletedEmail = async (
  email: string,
  firstName: string,
  applicationId: string,
  loanType: string,
  amount: number,
  deletedAt: Date
) => {
  try {
    const frontendUrl = getFrontendUrl();
    const dashboardLink = `${frontendUrl}/dashboard`;

    const emailData: ApplicationDeletedData = {
      firstName,
      applicationId,
      loanType,
      amount,
      deletedAt: deletedAt.toISOString(),
      dashboardLink,
    };

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: `Application Deleted - ${applicationId}`,
      html: applicationDeletedTemplate(emailData),
      text: `Dear ${firstName},\n\nYour loan application (ID: ${applicationId}) has been successfully deleted.\n\nDeleted on: ${deletedAt.toLocaleString()}\n\nYou can submit a new application anytime from your dashboard: ${dashboardLink}\n\nLOANLO Team`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending application deleted email:', error);
    // Don't throw - we don't want email failures to break the application flow
  }
};

/**
 * Send email to underwriters when an application is deleted by applicant
 */
export const sendApplicationDeletedNotificationToUnderwriters = async (
  applicantName: string,
  applicationId: string,
  loanType: string,
  amount: number,
  previousStatus: string,
  deletedAt: Date
) => {
  try {
    // Get all underwriter emails from environment variable
    const underwriterEmails = (process.env.UNDERWRITER_EMAILS || '')
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (underwriterEmails.length === 0) {
      console.warn('⚠️ No underwriter emails configured in UNDERWRITER_EMAILS');
      return;
    }

    const frontendUrl = getFrontendUrl();
    const underwriterDashboardLink = `${frontendUrl}/dashboard/underwriter`;

    // Send to all underwriters
    const emailPromises = underwriterEmails.map(async (underwriterEmail) => {
      // Extract first name from email (basic implementation)
      const underwriterName = (underwriterEmail.split('@')[0] || 'Underwriter')
        .split('.')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const emailData: ApplicationDeletedUnderwriterData = {
        underwriterName,
        applicantName,
        applicationId,
        loanType,
        amount,
        deletedAt: deletedAt.toISOString(),
        previousStatus,
        underwriterDashboardLink,
      };

      const msg = {
        to: underwriterEmail,
        from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
        subject: `Application Deleted by Applicant - ${applicationId}`,
        html: applicationDeletedUnderwriterTemplate(emailData),
        text: `Dear ${underwriterName},\n\nAn application has been deleted by the applicant.\n\nApplicant: ${applicantName}\nApplication ID: ${applicationId}\nLoan Type: ${loanType}\nPrevious Status: ${previousStatus}\nDeleted on: ${deletedAt.toLocaleString()}\n\nNo action required. View dashboard: ${underwriterDashboardLink}\n\nLOANLO Team`,
      };

      return sgMail.send(msg);
    });

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('❌ Error sending application deleted notification to underwriters:', error);
  }
};

/**
 * Send confirmation email to underwriter when they request restoration of a deleted application
 */
export const sendUnderwriterRestorationRequestConfirmation = async (
  underwriterEmail: string,
  underwriterName: string,
  applicantName: string,
  applicationId: string,
  loanType: string,
  amount: number,
  deletedAt: Date,
  restorationReason: string
) => {
  try {
    const frontendUrl = getFrontendUrl();
    const underwriterDashboardLink = `${frontendUrl}/dashboard/underwriter`;

    const emailData: UnderwriterRestorationRequestConfirmationData = {
      underwriterName,
      underwriterEmail,
      applicantName,
      applicationId,
      loanType,
      amount,
      deletedAt: deletedAt.toISOString(),
      restorationReason,
      requestedAt: new Date().toISOString(),
      underwriterDashboardLink,
    };

    const msg = {
      to: underwriterEmail,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: `Restoration Request Submitted - ${applicationId}`,
      html: underwriterRestorationRequestConfirmationTemplate(emailData),
      text: `Dear ${underwriterName},\n\nYour request to restore the deleted loan application (ID: ${applicationId}) has been submitted successfully.\n\nApplicant: ${applicantName}\nDeleted on: ${deletedAt.toLocaleString()}\n\nReason: ${restorationReason}\n\nThe system administrator will review your request and get back to you shortly.\n\nView dashboard: ${underwriterDashboardLink}\n\nLOANLO Team`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending underwriter restoration request confirmation email:', error);
    // Don't throw - we don't want email failures to break the application flow
  }
};

/**
 * Send notification to system admin when underwriter requests restoration
 */
export const sendUnderwriterRestorationRequestToAdmin = async (
  underwriterName: string,
  underwriterEmail: string,
  applicantName: string,
  applicationId: string,
  loanType: string,
  amount: number,
  deletedAt: Date,
  restorationReason: string
) => {
  try {
    // Get system admin email from environment variable
    const adminEmail = process.env.SYSTEM_ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn('⚠️ No system admin email configured in SYSTEM_ADMIN_EMAIL');
      return;
    }

    const frontendUrl = getFrontendUrl();
    const adminDashboardLink = `${frontendUrl}/dashboard/admin`;

    // Extract admin name from email (basic implementation)
    const adminName = (adminEmail.split('@')[0] || 'Admin')
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const emailData: UnderwriterRestorationRequestAdminData = {
      adminName,
      underwriterName,
      underwriterEmail,
      applicantName,
      applicationId,
      loanType,
      amount,
      deletedAt: deletedAt.toISOString(),
      restorationReason,
      requestedAt: new Date().toISOString(),
      adminDashboardLink,
    };

    const msg = {
      to: adminEmail,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: `⚠️ Action Required: Application Restoration Request - ${applicationId}`,
      html: underwriterRestorationRequestAdminTemplate(emailData),
      text: `Dear ${adminName},\n\nACTION REQUIRED: An underwriter has requested restoration of a deleted loan application.\n\nRequested by: ${underwriterName} (${underwriterEmail})\nApplicant: ${applicantName}\nApplication ID: ${applicationId}\nLoan Type: ${loanType}\nDeleted on: ${deletedAt.toLocaleString()}\n\nRestoration Reason:\n${restorationReason}\n\nPlease review and approve/reject this request from your admin dashboard: ${adminDashboardLink}\n\nLOANLO Team`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending restoration request notification to admin:', error);
  }
};

/**
 * Send email to underwriter when their restoration request is APPROVED
 */
export const sendRestorationApprovedEmail = async (
  underwriterEmail: string,
  underwriterName: string,
  applicantName: string,
  applicationId: string,
  loanType: string,
  amount: number,
  restorationReason: string,
  adminNotes?: string
) => {
  try {
    const frontendUrl = getFrontendUrl();
    const underwriterDashboardLink = `${frontendUrl}/dashboard/underwriter`;

    const emailData: RestorationApprovedData = {
      underwriterName,
      applicationId,
      applicantName,
      loanType,
      amount,
      restorationReason,
      ...(adminNotes && { adminNotes }), // Only include if it exists
      approvedAt: new Date().toISOString(),
      underwriterDashboardLink,
    };

    const msg = {
      to: underwriterEmail,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: `✓ Restoration Request Approved - ${applicationId}`,
      html: restorationApprovedTemplate(emailData),
      text: `Dear ${underwriterName},\n\nGood news! Your restoration request has been approved.\n\nApplication ID: ${applicationId}\nApplicant: ${applicantName}\n\nThe application has been successfully restored and is now available in your dashboard.\n\n${adminNotes ? `Admin Notes: ${adminNotes}\n\n` : ''}View dashboard: ${underwriterDashboardLink}\n\nLOANLO Team`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending restoration approved email:', error);
    // Don't throw - we don't want email failures to break the application flow
  }
};

/**
 * Send email to underwriter when their restoration request is REJECTED
 */
export const sendRestorationRejectedEmail = async (
  underwriterEmail: string,
  underwriterName: string,
  applicantName: string,
  applicationId: string,
  loanType: string,
  amount: number,
  restorationReason: string,
  rejectionNotes: string
) => {
  try {
    const frontendUrl = getFrontendUrl();
    const underwriterDashboardLink = `${frontendUrl}/dashboard/underwriter`;

    const emailData: RestorationRejectedData = {
      underwriterName,
      applicationId,
      applicantName,
      loanType,
      amount,
      restorationReason,
      rejectionNotes,
      rejectedAt: new Date().toISOString(),
      underwriterDashboardLink,
    };

    const msg = {
      to: underwriterEmail,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: `Restoration Request Rejected - ${applicationId}`,
      html: restorationRejectedTemplate(emailData),
      text: `Dear ${underwriterName},\n\nYour restoration request has been rejected by the system administrator.\n\nApplication ID: ${applicationId}\nApplicant: ${applicantName}\n\nRejection Reason:\n${rejectionNotes}\n\nIf you believe this decision requires further review, please contact the system administrator.\n\nView dashboard: ${underwriterDashboardLink}\n\nLOANLO Team`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending restoration rejected email:', error);
    // Don't throw - we don't want email failures to break the application flow
  }
};

/**
 * Send email to applicant when their deleted application is restored
 */
export const sendApplicationRestoredEmail = async (
  applicantEmail: string,
  applicantName: string,
  applicationId: string,
  loanType: string,
  amount: number,
  restorationReason: string,
  underwriterName: string
) => {
  try {
    const frontendUrl = getFrontendUrl();
    const applicationStatusLink = `${frontendUrl}/application-status`;

    const emailData: ApplicationRestoredData = {
      applicantName,
      applicationId,
      loanType,
      amount,
      restoredAt: new Date().toISOString(),
      restorationReason,
      underwriterName,
      applicationStatusLink,
    };

    const msg = {
      to: applicantEmail,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: `Application Restored - ${applicationId}`,
      html: applicationRestoredTemplate(emailData),
      text: `Dear ${applicantName},\n\nYour previously deleted loan application (ID: ${applicationId}) has been restored by the system administrator on request of ${underwriterName}.\n\nReason: ${restorationReason}\n\nYou can now view and track your application in your dashboard: ${applicationStatusLink}\n\nLOANLO Team`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending application restored email to applicant:', error);
    // Don't throw - we don't want email failures to break the application flow
  }
};

// Update the default export at the bottom of emailService.ts to include:
export default {
  sendLoanApplicationSubmittedEmail,
  sendLoanStatusUpdateEmail,
  sendNewApplicationNotificationToUnderwriters,
  sendDocumentsRequestedEmail,
  sendApplicationDeletedEmail,
  sendApplicationDeletedNotificationToUnderwriters,
  sendUnderwriterRestorationRequestConfirmation,
  sendUnderwriterRestorationRequestToAdmin,
  sendRestorationApprovedEmail,
  sendRestorationRejectedEmail,
  sendApplicationRestoredEmail,
};