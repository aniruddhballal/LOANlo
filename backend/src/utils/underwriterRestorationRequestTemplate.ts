/**
 * Email templates for underwriter restoration requests
 */

/**
 * Data for confirmation email to underwriter who requested restoration
 */
export interface UnderwriterRestorationRequestConfirmationData {
  underwriterName: string;
  underwriterEmail: string;
  applicantName: string;
  applicationId: string;
  loanType: string;
  amount: number;
  deletedAt: string; // ISO string
  restorationReason: string;
  requestedAt: string; // ISO string
  underwriterDashboardLink: string;
}

/**
 * Data for notification email to system admin about restoration request
 */
export interface UnderwriterRestorationRequestAdminData {
  adminName: string;
  underwriterName: string;
  underwriterEmail: string;
  applicantName: string;
  applicationId: string;
  loanType: string;
  amount: number;
  deletedAt: string; // ISO string
  restorationReason: string;
  requestedAt: string; // ISO string
  adminDashboardLink: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatLoanType = (loanType: string): string => {
  return loanType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Confirmation email template sent to underwriter after requesting restoration
 */
export const underwriterRestorationRequestConfirmationTemplate = (
  data: UnderwriterRestorationRequestConfirmationData
): string => {
  const formattedAmount = formatCurrency(data.amount);
  const formattedLoanType = formatLoanType(data.loanType);
  const formattedDeletedAt = formatDate(data.deletedAt);
  const formattedRequestedAt = formatDate(data.requestedAt);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restoration Request Submitted - LOANLO</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 48px 40px; text-align: center;">
                  <div style="width: 64px; height: 64px; background-color: #ffffff; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">
                    RESTORATION REQUEST CONFIRMATION
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Restoration Request Submitted
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.underwriterName},
                  </p>
                  
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Your request to restore a deleted loan application has been successfully submitted to the system administrator for review and approval.
                  </p>
                  
                  <!-- Status Alert -->
                  <div style="padding: 20px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                      <strong>Request Status:</strong> Pending Admin Approval • Submitted on ${formattedRequestedAt}
                    </p>
                  </div>
                  
                  <!-- Application Details Card -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #111827;">
                    <p style="margin: 0 0 16px 0; color: #111827; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      APPLICATION DETAILS
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Application ID</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.applicationId}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Applicant Name</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.applicantName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Loan Type</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${formattedLoanType}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Loan Amount</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${formattedAmount}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Deleted On</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${formattedDeletedAt}</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Restoration Reason Card -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 32px;">
                    <p style="margin: 0 0 12px 0; color: #111827; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      YOUR RESTORATION REASON
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                      ${data.restorationReason}
                    </p>
                  </div>
                  
                  <!-- What Happens Next -->
                  <div style="padding: 24px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                      What Happens Next?
                    </p>
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                      The system administrator will review your restoration request and the reason provided. You will be notified once a decision has been made. This typically takes 1-2 business days.
                    </p>
                  </div>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 32px 0;">
                        <a href="${data.underwriterDashboardLink}" 
                           style="display: inline-block; padding: 16px 48px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 16px; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                          VIEW DASHBOARD
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative Link -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                      Alternative link to dashboard:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${data.underwriterDashboardLink}" style="color: #111827; font-size: 12px; text-decoration: none;">
                        ${data.underwriterDashboardLink}
                      </a>
                    </p>
                  </div>
                  
                  <div style="padding: 20px; background-color: #eff6ff; border-radius: 12px;">
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                      <strong>Questions?</strong> Contact the system administrator if you need to provide additional information about this restoration request.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 12px; letter-spacing: 0.5px;">
                          SECURE • ENCRYPTED • COMPLIANT
                        </p>
                        <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 11px;">
                          © 2025 LOANLO. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                          Professional Loan Origination Platform
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Notification email template sent to system admin about restoration request
 */
export const underwriterRestorationRequestAdminTemplate = (
  data: UnderwriterRestorationRequestAdminData
): string => {
  const formattedAmount = formatCurrency(data.amount);
  const formattedLoanType = formatLoanType(data.loanType);
  const formattedDeletedAt = formatDate(data.deletedAt);
  const formattedRequestedAt = formatDate(data.requestedAt);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restoration Request - Action Required - LOANLO</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 48px 40px; text-align: center;">
                  <div style="width: 64px; height: 64px; background-color: #ffffff; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; letter-spacing: 1px;">
                    ⚠️ ACTION REQUIRED - RESTORATION REQUEST
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Application Restoration Request
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.adminName},
                  </p>
                  
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    An underwriter has requested restoration of a deleted loan application. Your review and approval are required to proceed with the restoration.
                  </p>
                  
                  <!-- Priority Alert -->
                  <div style="padding: 20px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5; font-weight: 600;">
                      ⚠️ ACTION REQUIRED: Restoration Request Pending
                    </p>
                    <p style="margin: 8px 0 0 0; color: #991b1b; font-size: 13px; line-height: 1.5;">
                      Requested on ${formattedRequestedAt}
                    </p>
                  </div>
                  
                  <!-- Underwriter Information Card -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0 0 16px 0; color: #111827; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      REQUESTED BY
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Underwriter Name</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.underwriterName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Email</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.underwriterEmail}</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Application Details Card -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #111827;">
                    <p style="margin: 0 0 16px 0; color: #111827; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      APPLICATION DETAILS
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Application ID</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.applicationId}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Applicant Name</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.applicantName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Loan Type</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${formattedLoanType}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Loan Amount</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${formattedAmount}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Deleted On</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${formattedDeletedAt}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Status</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="display: inline-block; padding: 4px 12px; background-color: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 600; border-radius: 6px; letter-spacing: 0.5px;">DELETED</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Restoration Reason Card -->
                  <div style="padding: 24px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 12px; margin-bottom: 32px;">
                    <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      RESTORATION REASON
                    </p>
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                      ${data.restorationReason}
                    </p>
                  </div>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 32px 0;">
                        <a href="${data.adminDashboardLink}" 
                           style="display: inline-block; padding: 16px 48px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 16px; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                          REVIEW REQUEST
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative Link -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                      Alternative link to admin dashboard:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${data.adminDashboardLink}" style="color: #111827; font-size: 12px; text-decoration: none;">
                        ${data.adminDashboardLink}
                      </a>
                    </p>
                  </div>
                  
                  <!-- Next Steps -->
                  <div style="padding: 20px; background-color: #eff6ff; border-radius: 12px;">
                    <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                      Next Steps:
                    </p>
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.6;">
                      1. Review the restoration reason provided by the underwriter<br>
                      2. Check the application details and history<br>
                      3. Approve or reject the restoration request from your admin dashboard
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 12px; letter-spacing: 0.5px;">
                          SECURE • ENCRYPTED • COMPLIANT
                        </p>
                        <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 11px;">
                          © 2025 LOANLO. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                          Professional Loan Origination Platform
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};