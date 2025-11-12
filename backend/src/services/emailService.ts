import nodemailer from 'nodemailer';
import { verificationEmailTemplate, welcomeEmailTemplate, VerificationEmailData, WelcomeEmailData } from '../utils/emailTemplates';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,        // your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD // your Gmail App Password
  },
});

const getFrontendUrl = () => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
  if (process.env.NODE_ENV === 'production') {
    return allowedOrigins.find(origin => !origin.includes('localhost')) || allowedOrigins[0];
  }
  return allowedOrigins.find(origin => origin.includes('localhost')) || allowedOrigins[0];
};

export const sendVerificationEmail = async (email: string, firstName: string, verificationToken: string) => {
  try {
    const frontendUrl = getFrontendUrl();
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const emailData: VerificationEmailData = { firstName, verificationLink };

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email Address - LOANLO',
      html: verificationEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nPlease verify your email: ${verificationLink}\n\nLOANLO Team`,
    });
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    const emailData: WelcomeEmailData = { firstName, email };
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to LOANLO - Account Verified',
      html: welcomeEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nYour account ${email} is now verified.\n\nLOANLO Team`,
    });
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

export const resendVerificationEmail = async (email: string, firstName: string, verificationToken: string) =>
  sendVerificationEmail(email, firstName, verificationToken);

export default { sendVerificationEmail, sendWelcomeEmail, resendVerificationEmail };