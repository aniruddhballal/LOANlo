/**
 * Email templates for admin responses to restoration requests
 */

/**
 * Data for restoration approved email to underwriter
 */
export interface RestorationApprovedData {
  underwriterName: string;
  applicationId: string;
  applicantName: string;
  loanType: string;
  amount: number;
  restorationReason: string;
  adminNotes?: string | undefined;
  approvedAt: string; // ISO string
  underwriterDashboardLink: string;
}

/**
 * Data for restoration rejected email to underwriter
 */
export interface RestorationRejectedData {
  underwriterName: string;
  applicationId: string;
  applicantName: string;
  loanType: string;
  amount: number;
  restorationReason: string;
  rejectionNotes: string;
  rejectedAt: string; // ISO string
  underwriterDashboardLink: string;
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
 * Email template sent to underwriter when restoration request is APPROVED
 */
export const restorationApprovedTemplate = (data: RestorationApprovedData): string => {
  const formattedAmount = formatCurrency(data.amount);
  const formattedLoanType = formatLoanType(data.loanType);
  const formattedApprovedAt = formatDate(data.approvedAt);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restoration Request Approved - LOANLO</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 40px; text-align: center;">
                  <div style="width: 64px; height: 64px; background-color: #ffffff; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.95); font-size: 14px; letter-spacing: 1px;">
                    ✓ RESTORATION APPROVED
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Request Approved Successfully
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.underwriterName},
                  </p>
                  
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Good news! Your restoration request has been approved by the system administrator. The application has been successfully restored and is now available for review.
                  </p>
                  
                  <!-- Success Alert -->
                  <div style="padding: 20px; background-color: #d1fae5; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.5; font-weight: 600;">
                      ✓ Application Restored • Approved on ${formattedApprovedAt}
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
                    </table>
                  </div>
                  
                  <!-- Your Restoration Reason -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; color: #111827; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      YOUR RESTORATION REASON
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                      ${data.restorationReason}
                    </p>
                  </div>
                  
                  ${data.adminNotes ? `
                    <!-- Admin Notes -->
                    <div style="padding: 24px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 12px; margin-bottom: 32px;">
                      <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                        ADMIN NOTES
                      </p>
                      <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.6;">
                        ${data.adminNotes}
                      </p>
                    </div>
                  ` : ''}
                  
                  <!-- Next Steps -->
                  <div style="padding: 24px; background-color: #d1fae5; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0 0 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">
                      Next Steps:
                    </p>
                    <p style="margin: 0; color: #065f46; font-size: 13px; line-height: 1.6;">
                      The application is now available in your dashboard. You can proceed with the review process as needed.
                    </p>
                  </div>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 32px 0;">
                        <a href="${data.underwriterDashboardLink}" 
                           style="display: inline-block; padding: 16px 48px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 16px; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                          VIEW APPLICATION
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
                      <strong>Questions?</strong> Contact the system administrator if you need any clarification.
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
 * Email template sent to underwriter when restoration request is REJECTED
 */
export const restorationRejectedTemplate = (data: RestorationRejectedData): string => {
  const formattedAmount = formatCurrency(data.amount);
  const formattedLoanType = formatLoanType(data.loanType);
  const formattedRejectedAt = formatDate(data.rejectedAt);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restoration Request Rejected - LOANLO</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 48px 40px; text-align: center;">
                  <div style="width: 64px; height: 64px; background-color: #ffffff; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.95); font-size: 14px; letter-spacing: 1px;">
                    RESTORATION REJECTED
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Request Not Approved
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.underwriterName},
                  </p>
                  
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    After careful review, your restoration request has been rejected by the system administrator. Please review the rejection reason below.
                  </p>
                  
                  <!-- Rejection Alert -->
                  <div style="padding: 20px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5; font-weight: 600;">
                      Request Rejected • Reviewed on ${formattedRejectedAt}
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
                    </table>
                  </div>
                  
                  <!-- Your Restoration Reason -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; color: #111827; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      YOUR RESTORATION REASON
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                      ${data.restorationReason}
                    </p>
                  </div>
                  
                  <!-- Rejection Reason -->
                  <div style="padding: 24px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 12px; margin-bottom: 32px;">
                    <p style="margin: 0 0 12px 0; color: #991b1b; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      REJECTION REASON
                    </p>
                    <p style="margin: 0; color: #991b1b; font-size: 13px; line-height: 1.6;">
                      ${data.rejectionNotes}
                    </p>
                  </div>
                  
                  <!-- Next Steps -->
                  <div style="padding: 24px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                      What You Can Do:
                    </p>
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                      If you believe this decision requires further review, please contact the system administrator directly with additional context or information.
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
                      <strong>Need Help?</strong> Contact the system administrator for further clarification.
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