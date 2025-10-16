// src/utils/loanEmailTemplates.ts
// Part 1: Interfaces, utilities, and Application Submitted Template

export interface LoanApplicationSubmittedData {
  firstName: string;
  applicationId: string;
  loanType: string;
  amount: number;
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

/**
 * Email template sent to applicant when they submit a loan application
 */
export const loanApplicationSubmittedTemplate = (data: LoanApplicationSubmittedData): string => {
  const formattedAmount = formatCurrency(data.amount);
  const formattedLoanType = formatLoanType(data.loanType);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Submitted - LOANLO</title>
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">
                    APPLICATION CONFIRMATION
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Application Received Successfully
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.firstName},
                  </p>
                  
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Thank you for submitting your loan application. We have successfully received your request and our team will review it shortly.
                  </p>
                  
                  <!-- Application Details Card -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 32px; border-left: 4px solid #111827;">
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
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Status</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <span style="display: inline-block; padding: 4px 12px; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 600; border-radius: 6px; letter-spacing: 0.5px;">PENDING</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 500;">
                    What Happens Next?
                  </h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                    <tr>
                      <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 500;">
                          1. Upload Required Documents
                        </p>
                        <p style="margin: 0; color: #6b7280; font-size: 13px;">
                          Complete your application by uploading all necessary documents.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 500;">
                          2. Application Review
                        </p>
                        <p style="margin: 0; color: #6b7280; font-size: 13px;">
                          Our underwriters will carefully review your application and documents.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0;">
                        <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 500;">
                          3. Decision Notification
                        </p>
                        <p style="margin: 0; color: #6b7280; font-size: 13px;">
                          You'll receive an email notification once a decision has been made.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 32px 0;">
                        <a href="${data.applicationStatusLink}" 
                           style="display: inline-block; padding: 16px 48px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 16px; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                          VIEW APPLICATION
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative Link -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                      Alternative link to view application:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${data.applicationStatusLink}" style="color: #111827; font-size: 12px; text-decoration: none;">
                        ${data.applicationStatusLink}
                      </a>
                    </p>
                  </div>
                  
                  <div style="padding: 20px; background-color: #eff6ff; border-radius: 12px;">
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                      <strong>Track Your Application:</strong> You can monitor your application status anytime by logging into your LOANLO dashboard.
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