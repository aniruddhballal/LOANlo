import nodemailer from 'nodemailer';
import config from '../config';
import { verificationEmailTemplate, welcomeEmailTemplate, VerificationEmailData, WelcomeEmailData } from '../utils/emailTemplates';

// Create reusable transporter
const createTransporter = () => {
  // For development, you can use Gmail or other SMTP services
  // For production, use services like SendGrid, AWS SES, or Mailgun
  
  if (process.env.NODE_ENV === 'production') {
    // Production transporter (configure based on your email service)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Development transporter (uses Ethereal for testing)
    // You can also use Gmail for development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
};

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  verificationToken: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    // Create verification link
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    // Prepare email data
    const emailData: VerificationEmailData = {
      firstName,
      verificationLink,
    };
    
    // Email options
    const mailOptions = {
      from: {
        name: 'LOANLO',
        address: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      },
      to: email,
      subject: 'Verify Your Email Address - LOANLO',
      html: verificationEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nThank you for registering with LOANLO. Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you did not create an account with LOANLO, please disregard this email.\n\nBest regards,\nLOANLO Team`,
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Verification email sent:', info.messageId);
    
    // For development with Ethereal
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send welcome email after successful verification
 */
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    // Prepare email data
    const emailData: WelcomeEmailData = {
      firstName,
      email,
    };
    
    // Email options
    const mailOptions = {
      from: {
        name: 'LOANLO',
        address: process.env.EMAIL_FROM || 'noreply@loanlo.com',
      },
      to: email,
      subject: 'Welcome to LOANLO - Account Verified',
      html: welcomeEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nCongratulations! Your email address has been successfully verified, and your account is now fully activated.\n\nYour account ${email} is now ready to use.\n\nNext Steps:\n1. Complete Your Profile\n2. Explore Loan Options\n3. Submit Your Application\n\nThank you for choosing LOANLO for your financial needs.\n\nBest regards,\nLOANLO Team`,
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Welcome email sent:', info.messageId);
    
    // For development with Ethereal
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email as it's not critical
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (
  email: string,
  firstName: string,
  verificationToken: string
): Promise<void> => {
  // Same as sendVerificationEmail
  await sendVerificationEmail(email, firstName, verificationToken);
};

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  resendVerificationEmail,
};