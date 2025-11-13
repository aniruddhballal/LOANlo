import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { verificationEmailTemplate, welcomeEmailTemplate, VerificationEmailData, WelcomeEmailData } from '../utils/emailTemplates';

const CLIENT_ID = process.env.GMAIL_OAUTH_CLIENT_ID!;
const CLIENT_SECRET = process.env.GMAIL_OAUTH_CLIENT_SECRET!;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_OAUTH_REFRESH_TOKEN!;
const SENDER_EMAIL = process.env.EMAIL_FROM!; // your Gmail

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // must be true for 465
  auth: {
    type: 'OAuth2',
    user: SENDER_EMAIL,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
    accessToken: async () => {
      const { token } = await oAuth2Client.getAccessToken();
      return token || '';
    },
  },
} as nodemailer.TransportOptions);

const getFrontendUrl = () => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());
  if (process.env.NODE_ENV === 'production') {
    return allowedOrigins.find(origin => !origin.includes('localhost')) || allowedOrigins[0];
  }
  return allowedOrigins.find(origin => origin.includes('localhost')) || allowedOrigins[0];
};

export const sendVerificationEmail = async (email: string, firstName: string, verificationToken: string) => {
  console.log('🔥 sendVerificationEmail called with:', { email, firstName, verificationToken: verificationToken?.slice(0, 6) + '...' });

  const frontendUrl = getFrontendUrl();
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
  const emailData: VerificationEmailData = { firstName, verificationLink };

  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: SENDER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken?.token,
      },
    } as any);

    const info = await transporter.sendMail({
      from: SENDER_EMAIL,
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

  const emailData: WelcomeEmailData = { firstName, email };

  try {
    const info = await transporter.sendMail({
      from: SENDER_EMAIL,
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