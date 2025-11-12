import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { verificationEmailTemplate, VerificationEmailData } from '../utils/emailTemplates';

const router = express.Router();

// Setup Nodemailer with Gmail App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Utility to get frontend URL
const getFrontendUrl = () => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
  if (process.env.NODE_ENV === 'production') {
    return allowedOrigins.find(origin => !origin.includes('localhost')) || allowedOrigins[0];
  }
  return allowedOrigins.find(origin => origin.includes('localhost')) || allowedOrigins[0];
};

// Resend verification email endpoint
router.post('/resend-verification', async (req: Request, res: Response) => {
  console.log('🔥 Resend verification request received:', req.body);

  const { email, firstName, verificationToken } = req.body;

  if (!email || !firstName || !verificationToken) {
    console.warn('⚠️ Missing required fields');
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const frontendUrl = getFrontendUrl();
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const emailData: VerificationEmailData = { firstName, verificationLink };

    console.log(`✉️ Sending verification email to ${email}`);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email Address - LOANLO',
      html: verificationEmailTemplate(emailData),
      text: `Dear ${firstName},\n\nPlease verify your email: ${verificationLink}\n\nLOANLO Team`,
    });

    console.log(`✅ Email sent successfully to ${email}`);
    res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    res.status(500).json({ success: false, message: 'Failed to send verification email', error: String(error) });
  }
});

export default router;
