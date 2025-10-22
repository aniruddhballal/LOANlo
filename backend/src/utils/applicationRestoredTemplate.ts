/**
 * Email template for notifying applicant when their deleted application is restored
 */

export interface ApplicationRestoredData {
  applicantName: string;
  applicationId: string;
  loanType: string;
  amount: number;
  restoredAt: string; // ISO string
  restorationReason: string;
  underwriterName: string;
  applicationStatusLink: string;
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
 * Email template sent to applicant when their deleted application is restored
 */
export const applicationRestoredTemplate = (data: ApplicationRestoredData): string => {
  const formattedAmount = formatCurrency(data.amount);
  const formattedLoanType = formatLoanType(data.loanType);
  const formattedRestoredAt = formatDate(data.restoredAt);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Restored - LOANLO</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 48px 40px; text-align: center;">
                  <div style="width: 64px; height: 64px; background-color: #ffffff; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.95); font-size: 14px; letter-spacing: 1px;">
                    APPLICATION RESTORED
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Your Application Has Been Restored
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.applicantName},
                  </p>
                  
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    We're writing to inform you that your previously deleted loan application has been restored by our system administrator on the request of your assigned underwriter, ${data.underwriterName}.
                  </p>
                  
                  <!-- Info Alert -->
                  <div style="padding: 20px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5; font-weight: 600;">
                      ℹ️ Restored on ${formattedRestoredAt}
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
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Restored By</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.underwriterName}</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Restoration Reason -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 32px;">
                    <p style="margin: 0 0 12px 0; color: #111827; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      REASON FOR RESTORATION
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                      ${data.restorationReason}
                    </p>
                  </div>
                  
                  <!-- What This Means -->
                  <div style="padding: 24px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                      What This Means:
                    </p>
                    <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 13px; line-height: 1.6;">
                      • Your application is now active and visible in your dashboard
                    </p>
                    <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 13px; line-height: 1.6;">
                      • The review process will continue from where it left off
                    </p>
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.6;">
                      • You can track its status and upload any required documents
                    </p>
                  </div>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 32px 0;">
                        <a href="${data.applicationStatusLink}" 
                           style="display: inline-block; padding: 16px 48px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 16px; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                          VIEW APPLICATION
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative Link -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                      Alternative link to view your application:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${data.applicationStatusLink}" style="color: #111827; font-size: 12px; text-decoration: none;">
                        ${data.applicationStatusLink}
                      </a>
                    </p>
                  </div>
                  
                  <!-- Important Note -->
                  <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                      Important:
                    </p>
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                      If you did not request this restoration or have any concerns, please contact your underwriter or our support team immediately.
                    </p>
                  </div>
                  
                  <div style="padding: 20px; background-color: #eff6ff; border-radius: 12px;">
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                      <strong>Questions?</strong> Feel free to reach out to your assigned underwriter or our support team for any clarification.
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