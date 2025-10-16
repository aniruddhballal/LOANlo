/**
 * Email template sent to applicant when loan status changes
 */

export interface LoanStatusUpdateData {
  firstName: string;
  applicationId: string;
  loanType: string;
  amount: number;
  status: string;
  comment?: string | undefined;
  rejectionReason?: string | undefined;
  approvalDetails?: {
    approvedAmount?: number | undefined;
    interestRate?: number | undefined;
    tenure?: number | undefined;
  } | undefined;
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

const getStatusColor = (status: string): { bg: string; border: string; text: string } => {
  const colors = {
    pending: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    under_review: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    approved: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    rejected: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    documents_requested: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' }
  } as const;
  
  return colors[status as keyof typeof colors] || colors.pending;
};

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending Review',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    documents_requested: 'Documents Requested'
  };
  return statusMap[status] || status;
};

export const loanStatusUpdateTemplate = (data: LoanStatusUpdateData): string => {
  const formattedAmount = formatCurrency(data.amount);
  const formattedLoanType = formatLoanType(data.loanType);
  const statusColors = getStatusColor(data.status);
  const statusText = getStatusText(data.status);

  
  let statusMessage = '';
  let additionalInfo = '';

  switch (data.status) {
    case 'under_review':
      statusMessage = 'Your application is now being reviewed by our underwriting team.';
      additionalInfo = `
        <div style="padding: 20px; background-color: ${statusColors.bg}; border-left: 4px solid ${statusColors.border}; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0; color: ${statusColors.text}; font-size: 13px; line-height: 1.5;">
            <strong>Under Review:</strong> Our team is carefully evaluating your application and documents. We'll notify you once the review is complete.
          </p>
        </div>
      `;
      break;
    case 'approved':
      statusMessage = 'Congratulations! Your loan application has been approved.';
      additionalInfo = `
        <div style="padding: 20px; background-color: ${statusColors.bg}; border-left: 4px solid ${statusColors.border}; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px 0; color: ${statusColors.text}; font-size: 14px; font-weight: 600;">
            ✓ Application Approved
          </p>
          ${data.approvalDetails ? `
            <table width="100%" cellpadding="0" cellspacing="0">
              ${data.approvalDetails.approvedAmount ? `
                <tr>
                  <td style="padding: 4px 0;">
                    <p style="margin: 0; color: ${statusColors.text}; font-size: 13px;">Approved Amount:</p>
                  </td>
                  <td align="right" style="padding: 4px 0;">
                    <p style="margin: 0; color: ${statusColors.text}; font-size: 13px; font-weight: 600;">${formatCurrency(data.approvalDetails.approvedAmount)}</p>
                  </td>
                </tr>
              ` : ''}
              ${data.approvalDetails.interestRate ? `
                <tr>
                  <td style="padding: 4px 0;">
                    <p style="margin: 0; color: ${statusColors.text}; font-size: 13px;">Interest Rate:</p>
                  </td>
                  <td align="right" style="padding: 4px 0;">
                    <p style="margin: 0; color: ${statusColors.text}; font-size: 13px; font-weight: 600;">${data.approvalDetails.interestRate}%</p>
                  </td>
                </tr>
              ` : ''}
              ${data.approvalDetails.tenure ? `
                <tr>
                  <td style="padding: 4px 0;">
                    <p style="margin: 0; color: ${statusColors.text}; font-size: 13px;">Tenure:</p>
                  </td>
                  <td align="right" style="padding: 4px 0;">
                    <p style="margin: 0; color: ${statusColors.text}; font-size: 13px; font-weight: 600;">${data.approvalDetails.tenure} months</p>
                  </td>
                </tr>
              ` : ''}
            </table>
          ` : ''}
        </div>
      `;
      break;
    case 'rejected':
      statusMessage = 'We regret to inform you that your loan application has been rejected.';
      additionalInfo = `
        <div style="padding: 20px; background-color: ${statusColors.bg}; border-left: 4px solid ${statusColors.border}; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px 0; color: ${statusColors.text}; font-size: 14px; font-weight: 600;">
            Application Rejected
          </p>
          ${data.rejectionReason ? `
            <p style="margin: 0; color: ${statusColors.text}; font-size: 13px; line-height: 1.5;">
              <strong>Reason:</strong> ${data.rejectionReason}
            </p>
          ` : ''}
        </div>
      `;
      break;
    case 'documents_requested':
      statusMessage = 'Additional documents are required to process your application.';
      additionalInfo = `
        <div style="padding: 20px; background-color: ${statusColors.bg}; border-left: 4px solid ${statusColors.border}; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0; color: ${statusColors.text}; font-size: 13px; line-height: 1.5;">
            <strong>Action Required:</strong> Please upload the requested documents to continue processing your application.
          </p>
        </div>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Update - LOANLO</title>
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">
                    STATUS UPDATE
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Application Status Update
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.firstName},
                  </p>
                  
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    ${statusMessage}
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
                          <span style="display: inline-block; padding: 4px 12px; background-color: ${statusColors.bg}; color: ${statusColors.text}; font-size: 11px; font-weight: 600; border-radius: 6px; letter-spacing: 0.5px;">${statusText.toUpperCase()}</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  ${additionalInfo}
                  
                  ${data.comment ? `
                    <div style="padding: 20px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 32px;">
                      <p style="margin: 0 0 8px 0; color: #111827; font-size: 13px; font-weight: 600;">
                        Additional Comments:
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                        ${data.comment}
                      </p>
                    </div>
                  ` : ''}
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 32px 0;">
                        <a href="${data.applicationStatusLink}" 
                           style="display: inline-block; padding: 16px 48px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 16px; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                          VIEW DETAILS
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative Link -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                      Alternative link to view details:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${data.applicationStatusLink}" style="color: #111827; font-size: 12px; text-decoration: none;">
                        ${data.applicationStatusLink}
                      </a>
                    </p>
                  </div>
                  
                  <div style="padding: 20px; background-color: #eff6ff; border-radius: 12px;">
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                      <strong>Questions?</strong> Contact our support team if you need any clarification regarding your application status.
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