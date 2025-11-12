import nodemailer from 'nodemailer';
import { verificationEmailTemplate, welcomeEmailTemplate, VerificationEmailData, WelcomeEmailData } from '../utils/emailTemplates';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // must be true for 465
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD,
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
  console.log('🔥 sendVerificationEmail called with:', { email, firstName, verificationToken: verificationToken?.slice(0, 6) + '...' });

  if (!email || !firstName || !verificationToken) {
    console.warn('⚠️ Missing required fields for verification email');
    throw new Error('Missing required fields for verification email');
  }

  try {
    const frontendUrl = getFrontendUrl();
    console.log('🌐 Frontend URL resolved to:', frontendUrl);

    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const emailData: VerificationEmailData = { firstName, verificationLink };

    console.log(`✉️ Sending verification email to ${email} with link ${verificationLink}`);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email Address - LOANLO',
      html: verificationEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nPlease verify your email: ${verificationLink}\n\nLOANLO Team`,
    });

    console.log('✅ Verification email sent:', info.response);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {
  console.log('🔥 sendWelcomeEmail called with:', { email, firstName });

  if (!email || !firstName) {
    console.warn('⚠️ Missing required fields for welcome email');
    return;
  }

  try {
    const emailData: WelcomeEmailData = { firstName, email };
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to LOANLO - Account Verified',
      html: welcomeEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nYour account ${email} is now verified.\n\nLOANLO Team`,
    });

    console.log('✅ Welcome email sent:', info.response);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

export const resendVerificationEmail = async (email: string, firstName: string, verificationToken: string) => {
  console.log('🔥 resendVerificationEmail called');
  return sendVerificationEmail(email, firstName, verificationToken);
};

export default { sendVerificationEmail, sendWelcomeEmail, resendVerificationEmail };