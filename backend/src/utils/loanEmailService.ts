// src/services/loanEmailService.ts
// Create this as a NEW file for loan-related email functions

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

export default {
  sendLoanApplicationSubmittedEmail,
  sendLoanStatusUpdateEmail,
  sendNewApplicationNotificationToUnderwriters,
  sendDocumentsRequestedEmail,
  sendApplicationDeletedEmail,
  sendApplicationDeletedNotificationToUnderwriters,
};

