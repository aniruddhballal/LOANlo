import sgMail from '@sendgrid/mail';
import { verificationEmailTemplate, welcomeEmailTemplate, VerificationEmailData, WelcomeEmailData } from '../utils/emailTemplates';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const getFrontendUrl = () => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
  return allowedOrigins.find(origin => origin.includes('localhost')) || allowedOrigins[0];
};

export const sendVerificationEmail = async (email: string, firstName: string, verificationToken: string) => {
  try {
    const frontendUrl = getFrontendUrl();
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const emailData: VerificationEmailData = { firstName, verificationLink };

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: 'Verify Your Email Address - LOANLO',
      html: verificationEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nPlease verify your email: ${verificationLink}\n\nLOANLO Team`,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    const emailData: WelcomeEmailData = { firstName, email };
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      subject: 'Welcome to LOANLO - Account Verified',
      html: welcomeEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nYour account ${email} is now verified.\n\nLOANLO Team`,
    };
    await sgMail.send(msg);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

export const resendVerificationEmail = async (email: string, firstName: string, verificationToken: string) =>
  sendVerificationEmail(email, firstName, verificationToken);

export default { sendVerificationEmail, sendWelcomeEmail, resendVerificationEmail };