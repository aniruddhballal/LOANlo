import { google } from 'googleapis';
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
import { 
  profileDeletedApplicantTemplate, 
  ProfileDeletedApplicantData,
  profileDeletedUnderwriterTemplate,
  ProfileDeletedUnderwriterData,
  profileDeletedAdminTemplate,
  ProfileDeletedAdminData
} from './profileDeletedTemplate';
import { 
  profileRestoredApplicantTemplate, 
  ProfileRestoredApplicantData,
  profileRestoredUnderwriterTemplate,
  ProfileRestoredUnderwriterData
} from './profileRestoredTemplate';

const CLIENT_ID = process.env.GMAIL_OAUTH_CLIENT_ID!;
const CLIENT_SECRET = process.env.GMAIL_OAUTH_CLIENT_SECRET!;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_OAUTH_REFRESH_TOKEN!;
const SENDER_EMAIL = process.env.EMAIL_FROM || 'noreply@loanlo.com';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

const getFrontendUrl = () => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
  if (process.env.NODE_ENV === 'production') {
    return allowedOrigins.find(origin => !origin.includes('localhost')) || allowedOrigins[0];
  }
  return allowedOrigins.find(origin => origin.includes('localhost')) || allowedOrigins[0];
};

async function sendGmailAPIEmail(to: string, subject: string, html: string, text: string) {
  const messageParts = [
    `From: LOANLO <${SENDER_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ];
  const encodedMessage = Buffer.from(messageParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });
}

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
    const applicationStatusLink = `${frontendUrl}/my-loans`;

    const emailData: LoanApplicationSubmittedData = {
      firstName,
      applicationId,
      loanType,
      amount,
      applicationStatusLink: applicationStatusLink,
    };

    const html = loanApplicationSubmittedTemplate(emailData);
    const text = `Dear ${firstName},\n\nYour loan application (ID: ${applicationId}) has been received successfully. You can track its status in your dashboard: ${applicationStatusLink}\n\nLOANLO Team`;

    await sendGmailAPIEmail(email, `Loan Application Received - ${applicationId}`, html, text);
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
    const applicationStatusLink = `${frontendUrl}/my-loans`;
    
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
    
    const html = loanStatusUpdateTemplate(emailData);
    const text = `Dear ${firstName},\n\nYour loan application status has been updated to: ${statusText}\n\nApplication ID: ${applicationId}\nView details: ${applicationStatusLink}\n\nLOANLO Team`;

    await sendGmailAPIEmail(email, `Loan Application ${statusText} - ${applicationId}`, html, text);
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

      const html = newApplicationNotificationTemplate(emailData);
      const text = `Dear ${underwriterName},\n\nA new loan application has been submitted for review.\n\nApplicant: ${applicantName}\nApplication ID: ${applicationId}\nLoan Type: ${loanType}\n\nReview now: ${underwriterDashboardLink}\n\nLOANLO Team`;

      return sendGmailAPIEmail(underwriterEmail, `New Loan Application for Review - ${applicationId}`, html, text);
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
    const applicationStatusLink = `${frontendUrl}/my-loans`;

    const emailData: DocumentsRequestedData = {
      firstName,
      applicationId,
      loanType,
      ...(comment !== undefined && { comment }),
      applicationStatusLink: applicationStatusLink,
    };

    const html = documentsRequestedTemplate(emailData);
    const text = `Dear ${firstName},\n\nAdditional documents are required for your loan application (ID: ${applicationId}).\n\n${comment ? `Note: ${comment}\n\n` : ''}Please upload the documents in your dashboard: ${applicationStatusLink}\n\nLOANLO Team`;

    await sendGmailAPIEmail(email, `Additional Documents Required - ${applicationId}`, html, text);
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
      underwriterEmail: process.env.UNDERWRITER_EMAILS?.split(',')[0]?.trim() || 'support@loanlo.com',
    };

    const html = applicationDeletedTemplate(emailData);
    const text = `Dear ${firstName},\n\nYour loan application (ID: ${applicationId}) has been successfully deleted.\n\nDeleted on: ${deletedAt.toLocaleString()}\n\nIf you deleted this by mistake or wish to restore it, please contact the underwriter at: ${emailData.underwriterEmail}\n\nYou can submit a new application anytime from your dashboard: ${dashboardLink}\n\nLOANLO Team`;
    await sendGmailAPIEmail(email, `Application Deleted - ${applicationId}`, html, text);
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

      const html = applicationDeletedUnderwriterTemplate(emailData);
      const text = `Dear ${underwriterName},\n\nAn application has been deleted by the applicant.\n\nApplicant: ${applicantName}\nApplication ID: ${applicationId}\nLoan Type: ${loanType}\nPrevious Status: ${previousStatus}\nDeleted on: ${deletedAt.toLocaleString()}\n\nNo action required. View dashboard: ${underwriterDashboardLink}\n\nLOANLO Team`;

      return sendGmailAPIEmail(underwriterEmail, `Application Deleted by Applicant - ${applicationId}`, html, text);
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

    const html = underwriterRestorationRequestConfirmationTemplate(emailData);
    const text = `Dear ${underwriterName},\n\nYour request to restore the deleted loan application (ID: ${applicationId}) has been submitted successfully.\n\nApplicant: ${applicantName}\nDeleted on: ${deletedAt.toLocaleString()}\n\nReason: ${restorationReason}\n\nThe system administrator will review your request and get back to you shortly.\n\nView dashboard: ${underwriterDashboardLink}\n\nLOANLO Team`;

    await sendGmailAPIEmail(underwriterEmail, `Restoration Request Submitted - ${applicationId}`, html, text);
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
    const adminDashboardLink = `${frontendUrl}/admin/deleted-applications`;

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

    const html = underwriterRestorationRequestAdminTemplate(emailData);
    const text = `Dear ${adminName},\n\nACTION REQUIRED: An underwriter has requested restoration of a deleted loan application.\n\nRequested by: ${underwriterName} (${underwriterEmail})\nApplicant: ${applicantName}\nApplication ID: ${applicationId}\nLoan Type: ${loanType}\nDeleted on: ${deletedAt.toLocaleString()}\n\nRestoration Reason:\n${restorationReason}\n\nPlease review and approve/reject this request from your admin dashboard: ${adminDashboardLink}\n\nLOANLO Team`;

    await sendGmailAPIEmail(adminEmail, `Action Required: Application Restoration Request - ${applicationId}`, html, text);
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

    const html = restorationApprovedTemplate(emailData);
    const text = `Dear ${underwriterName},\n\nGood news! Your restoration request has been approved.\n\nApplication ID: ${applicationId}\nApplicant: ${applicantName}\n\nThe application has been successfully restored and is now available in your dashboard.\n\n${adminNotes ? `Admin Notes: ${adminNotes}\n\n` : ''}View dashboard: ${underwriterDashboardLink}\n\nLOANLO Team`;

    await sendGmailAPIEmail(underwriterEmail, `Restoration Request Approved - ${applicationId}`, html, text);
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

    const html = restorationRejectedTemplate(emailData);
    const text = `Dear ${underwriterName},\n\nYour restoration request has been rejected by the system administrator.\n\nApplication ID: ${applicationId}\nApplicant: ${applicantName}\n\nRejection Reason:\n${rejectionNotes}\n\nIf you believe this decision requires further review, please contact the system administrator.\n\nView dashboard: ${underwriterDashboardLink}\n\nLOANLO Team`;

    await sendGmailAPIEmail(underwriterEmail, `Restoration Request Rejected - ${applicationId}`, html, text);
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
    const applicationStatusLink = `${frontendUrl}/my-loans`;

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

    const html = applicationRestoredTemplate(emailData);
    const text = `Dear ${applicantName},\n\nYour previously deleted loan application (ID: ${applicationId}) has been restored by the system administrator on request of ${underwriterName}.\n\nReason: ${restorationReason}\n\nYou can now view and track your application in your dashboard: ${applicationStatusLink}\n\nLOANLO Team`;

    await sendGmailAPIEmail(applicantEmail, `Application Restored - ${applicationId}`, html, text);
  } catch (error) {
    console.error('❌ Error sending application restored email to applicant:', error);
    // Don't throw - we don't want email failures to break the application flow
  }
};

/**
 * Send email to applicant when they delete their profile
 */
export const sendProfileDeletedEmail = async (
  email: string,
  firstName: string,
  applicationsCount: number,
  deletedAt: Date
) => {
  try {
    const supportEmail = process.env.SYSTEM_ADMIN_EMAIL || 'support@loanlo.com';

    const emailData: ProfileDeletedApplicantData = {
      firstName,
      email,
      deletedAt: deletedAt.toISOString(),
      applicationsCount,
      supportEmail,
    };

    const html = profileDeletedApplicantTemplate(emailData);
    const text = `Dear ${firstName},\n\nYour LOANLO account has been successfully deleted.\n\nDeleted on: ${deletedAt.toLocaleString()}\nApplications removed: ${applicationsCount}\n\nIf you deleted this by mistake or need to restore your account, please contact our support team at: ${supportEmail}\n\nLOANLO Team`;

    await sendGmailAPIEmail(email, `Profile Deleted - LOANLO`, html, text);
  } catch (error) {
    console.error('❌ Error sending profile deleted email:', error);
    // Don't throw - we don't want email failures to break the application flow
  }
};

/**
 * Send email to underwriters when an applicant deletes their profile
 */
export const sendProfileDeletedNotificationToUnderwriters = async (
  applicantName: string,
  applicantEmail: string,
  applicationsCount: number,
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

      const emailData: ProfileDeletedUnderwriterData = {
        underwriterName,
        applicantName,
        applicantEmail,
        deletedAt: deletedAt.toISOString(),
        applicationsCount,
        underwriterDashboardLink,
      };

      const html = profileDeletedUnderwriterTemplate(emailData);
      const text = `Dear ${underwriterName},\n\nAn applicant has deleted their profile.\n\nApplicant: ${applicantName} (${applicantEmail})\nApplications removed: ${applicationsCount}\nDeleted on: ${deletedAt.toLocaleString()}\n\nNo action required. View dashboard: ${underwriterDashboardLink}\n\nLOANLO Team`;

      return sendGmailAPIEmail(underwriterEmail, `Applicant Profile Deleted - ${applicantName}`, html, text);
    });

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('❌ Error sending profile deleted notification to underwriters:', error);
  }
};

/**
 * Send email to system admin when an applicant deletes their profile
 */
export const sendProfileDeletedNotificationToAdmin = async (
  applicantName: string,
  applicantEmail: string,
  applicationsCount: number,
  deletedAt: Date
) => {
  try {
    // Get system admin email from environment variable
    const adminEmail = process.env.SYSTEM_ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn('⚠️ No system admin email configured in SYSTEM_ADMIN_EMAIL');
      return;
    }

    const frontendUrl = getFrontendUrl();
    const adminDashboardLink = `${frontendUrl}/admin/deleted-users`;

    // Extract admin name from email (basic implementation)
    const adminName = (adminEmail.split('@')[0] || 'Admin')
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const emailData: ProfileDeletedAdminData = {
      adminName,
      applicantName,
      applicantEmail,
      deletedAt: deletedAt.toISOString(),
      applicationsCount,
      adminDashboardLink,
    };

    const html = profileDeletedAdminTemplate(emailData);
    const text = `Dear ${adminName},\n\nAn applicant has deleted their profile. This profile can be restored if needed.\n\nApplicant: ${applicantName} (${applicantEmail})\nApplications affected: ${applicationsCount}\nDeleted on: ${deletedAt.toLocaleString()}\n\nYou can restore this profile from your admin dashboard if the applicant requests it.\n\nView dashboard: ${adminDashboardLink}\n\nLOANLO Team`;

    await sendGmailAPIEmail(adminEmail, `Applicant Profile Deleted - ${applicantName}`, html, text);
  } catch (error) {
    console.error('❌ Error sending profile deleted notification to admin:', error);
  }
};

/**
 * Send email to applicant when their profile is restored
 */
export const sendProfileRestoredEmail = async (
  applicantEmail: string,
  applicantName: string,
  applicationsCount: number,
  restorationReason: string,
  restoredAt: Date
) => {
  try {
    const frontendUrl = getFrontendUrl();
    const applicationStatusLink = `${frontendUrl}/my-loans`;

    // Extract first name from full name
    const firstName = applicantName.split(' ')[0] ?? '';

    const emailData: ProfileRestoredApplicantData = {
      firstName,
      email: applicantEmail,
      restoredAt: restoredAt.toISOString(),
      applicationsCount,
      restorationReason,
      applicationStatusLink,
    };

    const html = profileRestoredApplicantTemplate(emailData);
    const text = `Dear ${firstName},\n\nGreat news! Your LOANLO account has been successfully restored.\n\nRestored on: ${restoredAt.toLocaleString()}\nApplications restored: ${applicationsCount}\n\nReason: ${restorationReason}\n\nYou can now access your applications: ${applicationStatusLink}\n\nLOANLO Team`;

    await sendGmailAPIEmail(applicantEmail, `Profile Restored - Welcome Back to LOANLO`, html, text);
  } catch (error) {
    console.error('❌ Error sending profile restored email to applicant:', error);
    // Don't throw - we don't want email failures to break the application flow
  }
};

/**
 * Send email to underwriters when an applicant profile is restored
 */
export const sendProfileRestoredNotificationToUnderwriters = async (
  applicantName: string,
  applicantEmail: string,
  applicationsCount: number,
  restorationReason: string,
  restoredAt: Date
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

      const emailData: ProfileRestoredUnderwriterData = {
        underwriterName,
        applicantName,
        applicantEmail,
        restoredAt: restoredAt.toISOString(),
        applicationsCount,
        restorationReason,
        underwriterDashboardLink,
      };

      const html = profileRestoredUnderwriterTemplate(emailData);
      const text = `Dear ${underwriterName},\n\nAn applicant profile has been restored.\n\nApplicant: ${applicantName} (${applicantEmail})\nApplications restored: ${applicationsCount}\nRestored on: ${restoredAt.toLocaleString()}\n\nReason: ${restorationReason}\n\nView dashboard: ${underwriterDashboardLink}\n\nLOANLO Team`;

      return sendGmailAPIEmail(underwriterEmail, `Applicant Profile Restored - ${applicantName}`, html, text);
    });

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('❌ Error sending profile restored notification to underwriters:', error);
  }
};

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
  sendProfileDeletedEmail,
  sendProfileDeletedNotificationToUnderwriters,
  sendProfileDeletedNotificationToAdmin,
  sendProfileRestoredEmail,
  sendProfileRestoredNotificationToUnderwriters,
};