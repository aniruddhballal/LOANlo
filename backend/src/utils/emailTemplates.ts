export interface VerificationEmailData {
  firstName: string;
  verificationLink: string;
}

export interface WelcomeEmailData {
  firstName: string;
  email: string;
}

/**
 * Email verification template
 */
export const verificationEmailTemplate = (data: VerificationEmailData): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - LOANLO</title>
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
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">
                    PROFESSIONAL LOAN ORIGINATION PLATFORM
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Verify Your Email Address
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.firstName},
                  </p>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Thank you for registering with LOANLO. To complete your account setup and ensure the security of your professional account, please verify your email address.
                  </p>
                  
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Click the button below to verify your email address and activate your account:
                  </p>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 32px 0;">
                        <a href="${data.verificationLink}" 
                           style="display: inline-block; padding: 16px 48px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 16px; font-size: 14px; font-weight: 500; letter-spacing: 1px; transition: all 0.3s;">
                          VERIFY EMAIL ADDRESS
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Alternative Link -->
                  <div style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; font-weight: 500;">
                      Alternative verification link:
                    </p>
                    <p style="margin: 0; word-break: break-all;">
                      <a href="${data.verificationLink}" style="color: #111827; font-size: 12px; text-decoration: none;">
                        ${data.verificationLink}
                      </a>
                    </p>
                  </div>
                  
                  <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                      <strong>Important:</strong> This verification link will expire in 24 hours for security purposes. If you did not create an account with LOANLO, please disregard this email.
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                    If you're having trouble with the button above, copy and paste the alternative link into your web browser.
                  </p>
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
 * Welcome email template (sent after verification)
 */
export const welcomeEmailTemplate = (data: WelcomeEmailData): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to LOANLO</title>
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
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 300; letter-spacing: 0.5px;">
                    LOAN<span style="font-weight: 600;">LO</span>
                  </h1>
                  <div style="width: 80px; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 16px auto;"></div>
                  <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; letter-spacing: 1px;">
                    PROFESSIONAL LOAN ORIGINATION PLATFORM
                  </p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 48px 40px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                    Welcome to LOANLO
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Dear ${data.firstName},
                  </p>
                  
                  <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                    Congratulations! Your email address has been successfully verified, and your account is now fully activated.
                  </p>
                  
                  <div style="padding: 24px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; margin-bottom: 32px;">
                    <p style="margin: 0 0 12px 0; color: #065f46; font-size: 14px; font-weight: 600;">
                      ✓ Account Verified
                    </p>
                    <p style="margin: 0; color: #047857; font-size: 13px; line-height: 1.5;">
                      Your account <strong>${data.email}</strong> is now ready to use.
                    </p>
                  </div>
                  
                  <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 500;">
                    Next Steps
                  </h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                    <tr>
                      <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 500;">
                          1. Complete Your Profile
                        </p>
                        <p style="margin: 0; color: #6b7280; font-size: 13px;">
                          Add additional information to enhance your application experience.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 500;">
                          2. Explore Loan Options
                        </p>
                        <p style="margin: 0; color: #6b7280; font-size: 13px;">
                          Browse available loan products tailored to your needs.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0;">
                        <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 500;">
                          3. Submit Your Application
                        </p>
                        <p style="margin: 0; color: #6b7280; font-size: 13px;">
                          Start your loan application process with our streamlined system.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="padding: 20px; background-color: #eff6ff; border-radius: 12px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                      <strong>Need Help?</strong> Our support team is available 24/7 to assist you with any questions or concerns.
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Thank you for choosing LOANLO for your financial needs.
                  </p>
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