// src/services/loanEmailService.ts
// Create this as a NEW file for loan-related email functions

import sgMail from '@sendgrid/mail';
import { loanApplicationSubmittedTemplate, LoanApplicationSubmittedData } from './LoanApplicationSubmittedData';
import { loanStatusUpdateTemplate, LoanStatusUpdateData } from './loanStatusUpdateTemplate';
import { newApplicationNotificationTemplate, NewApplicationNotificationData } from './newApplicationNotificationTemplate';
import { documentsRequestedTemplate, DocumentsRequestedData } from './documentsRequestedTemplate';

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
    console.log(`✅ Application submitted email sent to ${email}`);
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
    console.log(`✅ Status update email sent to ${email} (Status: ${status})`);
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
    console.log(`✅ New application notifications sent to ${underwriterEmails.length} underwriters`);
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
    console.log(`✅ Documents requested email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending documents requested email:', error);
  }
};

export default {
  sendLoanApplicationSubmittedEmail,
  sendLoanStatusUpdateEmail,
  sendNewApplicationNotificationToUnderwriters,
  sendDocumentsRequestedEmail,
};