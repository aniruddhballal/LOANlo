/**
 * Email templates for profile restoration notifications
 */

export interface ProfileRestoredApplicantData {
  firstName: string;
  email: string;
  restoredAt: string;
  applicationsCount: number;
  restorationReason: string;
  applicationStatusLink: string;
  
}

export interface ProfileRestoredUnderwriterData {
  underwriterName: string;
  applicantName: string;
  applicantEmail: string;
  restoredAt: string;
  applicationsCount: number;
  restorationReason: string;
  underwriterDashboardLink: string;
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const profileRestoredApplicantTemplate = (data: ProfileRestoredApplicantData): string => {
  const formattedDate = formatDate(data.restoredAt);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Profile Restored - LOANLO</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 48px 40px; text-align: center;">
                  <div style="width: 64px; height: 64px; background-color: #ffffff; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">
                    ✓ PROFILE RESTORED
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Welcome Back!
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.firstName},
                  </p>
                  
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Great news! Your LOANLO account has been successfully restored by our system administrator. Your profile and all associated loan applications are now active again.
                  </p>
                  
                  <!-- Success Notice -->
                  <div style="padding: 20px; background-color: #d1fae5; border-left: 4px solid #059669; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0; color: #065f46; font-size: 13px; line-height: 1.5;">
                      <strong>Account Restored:</strong> Your profile and all ${data.applicationsCount} loan application${data.applicationsCount !== 1 ? 's' : ''} have been successfully reactivated.
                    </p>
                  </div>
                  
                  <!-- Restoration Details Card -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 32px; border-left: 4px solid #059669;">
                    <p style="margin: 0 0 16px 0; color: #111827; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      RESTORATION DETAILS
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Email Address</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.email}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Applications Restored</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.applicationsCount}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Restored On</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${formattedDate}</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Restoration Reason Box -->
                  <div style="padding: 20px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 32px;">
                    <p style="margin: 0 0 8px 0; color: #111827; font-size: 13px; font-weight: 600;">
                      Restoration Reason
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                      ${data.restorationReason}
                    </p>
                  </div>
                  
                  <!-- What's Next Box -->
                  <div style="padding: 20px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 32px;">
                    <p style="margin: 0 0 8px 0; color: #111827; font-size: 13px; font-weight: 600;">
                      What happens next?
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                      • Your account is now fully active<br/>
                      • All ${data.applicationsCount} loan application${data.applicationsCount !== 1 ? 's' : ''} ${data.applicationsCount !== 1 ? 'are' : 'is'} available in your dashboard<br/>
                      • You can track application status and upload documents<br/>
                      • You'll receive email notifications for any updates
                    </p>
                  </div>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 32px 0;">
                        <a href="${data.applicationStatusLink}" 
                           style="display: inline-block; padding: 16px 48px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 16px; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                          VIEW MY APPLICATIONS
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative Link -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                      Alternative link to application status:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${data.applicationStatusLink}" style="color: #059669; font-size: 12px; text-decoration: none;">
                        ${data.applicationStatusLink}
                      </a>
                    </p>
                  </div>
                  
                  <div style="padding: 20px; background-color: #eff6ff; border-radius: 12px;">
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                      <strong>Questions?</strong> If you have any questions about your restored account or applications, please contact our support team.
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

export const profileRestoredUnderwriterTemplate = (data: ProfileRestoredUnderwriterData): string => {
  const formattedDate = formatDate(data.restoredAt);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Profile Restored - LOANLO</title>
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
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">
                    APPLICANT PROFILE RESTORED
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Applicant Profile Restored
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.underwriterName},
                  </p>
                  
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    A previously deleted applicant profile has been restored by the system administrator. All applications associated with this profile are now available in your review queue.
                  </p>
                  
                  <!-- Success Notice -->
                  <div style="padding: 20px; background-color: #d1fae5; border-left: 4px solid #059669; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0; color: #065f46; font-size: 13px; line-height: 1.5;">
                      <strong>Profile Restored:</strong> ${data.applicationsCount} application${data.applicationsCount !== 1 ? 's' : ''} from this applicant ${data.applicationsCount !== 1 ? 'are' : 'is'} now active in your queue.
                    </p>
                  </div>
                  
                  <!-- Restoration Details Card -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 32px; border-left: 4px solid #111827;">
                    <p style="margin: 0 0 16px 0; color: #111827; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      RESTORED PROFILE DETAILS
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
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
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Email Address</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.applicantEmail}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Applications Restored</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${data.applicationsCount}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 13px;">Restored On</p>
                        </td>
                        <td align="right" style="padding: 8px 0;">
                          <p style="margin: 0; color: #111827; font-size: 13px; font-weight: 600;">${formattedDate}</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- Restoration Reason Box -->
                  <div style="padding: 20px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 32px;">
                    <p style="margin: 0 0 8px 0; color: #111827; font-size: 13px; font-weight: 600;">
                      Restoration Reason
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                      ${data.restorationReason}
                    </p>
                  </div>
                  
                  <!-- Info Box -->
                  <div style="padding: 20px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 32px;">
                    <p style="margin: 0 0 8px 0; color: #111827; font-size: 13px; font-weight: 600;">
                      Next Steps
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                      The applicant's profile and all associated applications are now active. You can review and process these applications from your dashboard as usual.
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
                      <strong>Need Help?</strong> Contact the system administrator if you have any questions about this restoration.
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