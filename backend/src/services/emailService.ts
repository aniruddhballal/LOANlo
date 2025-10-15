import nodemailer from 'nodemailer';
import { verificationEmailTemplate, welcomeEmailTemplate, VerificationEmailData, WelcomeEmailData } from '../utils/emailTemplates';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const getFrontendUrl = () => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
  // In production, don't use localhost
  if (process.env.NODE_ENV === 'production') {
    return allowedOrigins.find(origin => !origin.includes('localhost')) || allowedOrigins[0];
  }
  // In development, prefer localhost
  return allowedOrigins.find(origin => origin.includes('localhost')) || allowedOrigins[0];
};

export const sendVerificationEmail = async (email: string, firstName: string, verificationToken: string) => {
  try {
    const frontendUrl = getFrontendUrl();
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const emailData: VerificationEmailData = { firstName, verificationLink };
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      to: email,
      subject: 'Verify Your Email Address - LOANLO',
      html: verificationEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nPlease verify your email: ${verificationLink}\n\nLOANLO Team`,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    const emailData: WelcomeEmailData = { firstName, email };
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      to: email,
      subject: 'Welcome to LOANLO - Account Verified',
      html: welcomeEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nYour account ${email} is now verified.\n\nLOANLO Team`,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

export const resendVerificationEmail = async (email: string, firstName: string, verificationToken: string) =>
  sendVerificationEmail(email, firstName, verificationToken);

export default { sendVerificationEmail, sendWelcomeEmail, resendVerificationEmail };