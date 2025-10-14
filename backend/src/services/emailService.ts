import nodemailer from 'nodemailer';
import { verificationEmailTemplate, welcomeEmailTemplate, VerificationEmailData, WelcomeEmailData } from '../utils/emailTemplates';

/**
 * Create a strict SendGrid transporter
 */
const createTransporter = () => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('❌ SENDGRID_API_KEY is missing in environment variables.');
  }

  return nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey', // Always this literal value for SendGrid
      pass: process.env.SENDGRID_API_KEY,
    },
  });
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  verificationToken: string
): Promise<void> => {
  const transporter = createTransporter();

  try {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    const frontendUrl = allowedOrigins.find(origin => origin.includes('localhost')) || allowedOrigins[0];
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const emailData: VerificationEmailData = { firstName, verificationLink };

    const mailOptions = {
      from: {
        name: 'LOANLO',
        address: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      },
      to: email,
      subject: 'Verify Your Email Address - LOANLO',
      html: verificationEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nPlease verify your email: ${verificationLink}\n\nThis link expires in 24 hours.\n\nLOANLO Team`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error.message);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<void> => {
  const transporter = createTransporter();

  try {
    const emailData: WelcomeEmailData = { firstName, email };

    const mailOptions = {
      from: {
        name: 'LOANLO',
        address: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      },
      to: email,
      subject: 'Welcome to LOANLO - Account Verified',
      html: welcomeEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nYour account ${email} is now verified and ready.\n\nLOANLO Team`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error('❌ Error sending welcome email:', error.message);
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (
  email: string,
  firstName: string,
  verificationToken: string
) => sendVerificationEmail(email, firstName, verificationToken);

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  resendVerificationEmail,
};
