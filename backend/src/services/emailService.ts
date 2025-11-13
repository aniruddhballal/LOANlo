import { google } from 'googleapis';
import {
  verificationEmailTemplate,
  welcomeEmailTemplate,
  VerificationEmailData,
  WelcomeEmailData,
  passwordResetEmailTemplate,
  PasswordResetEmailData
} from '../utils/emailTemplates';

const CLIENT_ID = process.env.GMAIL_OAUTH_CLIENT_ID!;
const CLIENT_SECRET = process.env.GMAIL_OAUTH_CLIENT_SECRET!;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_OAUTH_REFRESH_TOKEN!;
const SENDER_EMAIL = process.env.EMAIL_FROM!;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

const getFrontendUrl = () => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
  if (process.env.NODE_ENV === 'production') {
    return allowedOrigins.find(origin => !origin.includes('localhost')) || allowedOrigins[0];
  }
  return allowedOrigins.find(origin => origin.includes('localhost')) || allowedOrigins[0];
};

async function sendGmailAPIEmail(to: string, subject: string, html: string, text: string) {
  const messageParts = [
    `From: LOANLO <${SENDER_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ];

  const encodedMessage = Buffer.from(messageParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage },
  });
}

export const sendVerificationEmail = async (email: string, firstName: string, verificationToken: string) => {

  const frontendUrl = getFrontendUrl();
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
  const emailData: VerificationEmailData = { firstName, verificationLink };

  const html = verificationEmailTemplate(emailData);
  const text = `Dear ${firstName},\n\nPlease verify your email: ${verificationLink}\n\nLOANLO Team`;

  try {
    await sendGmailAPIEmail(email, 'Verify Your Email Address - LOANLO', html, text);
  } catch (error) {
    throw new Error('Failed to send verification email');
  }
};

export const sendWelcomeEmail = async (email: string, firstName: string) => {

  const emailData: WelcomeEmailData = { firstName, email };
  const html = welcomeEmailTemplate(emailData);
  const text = `Dear ${firstName},\n\nYour account ${email} is now verified.\n\nLOANLO Team`;

  try {
    await sendGmailAPIEmail(email, 'Welcome to LOANLO - Account Verified', html, text);
  } catch (error) {
      throw new Error('Failed to send welcome email');
  }
};

export const resendVerificationEmail = async (email: string, firstName: string, verificationToken: string) => {
  return sendVerificationEmail(email, firstName, verificationToken);
};

export const sendPasswordResetEmail = async (
  email: string, 
  firstName: string, 
  resetToken: string
) => {
  const frontendUrl = getFrontendUrl();
  const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
  
  const emailData: PasswordResetEmailData = { firstName, resetLink };
  const html = passwordResetEmailTemplate(emailData);
  const text = `Dear ${firstName},\n\nReset your password: ${resetLink}\n\nThis link expires in 30 minutes.\n\nLOANLO Team`;
  
  try {
    await sendGmailAPIEmail(
      email, 
      'Reset Your Password - LOANLO', 
      html, 
      text
    );
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export default {
  sendVerificationEmail,
  sendWelcomeEmail,
  resendVerificationEmail,
  sendPasswordResetEmail
};