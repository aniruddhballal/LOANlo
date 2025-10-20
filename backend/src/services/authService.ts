import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config';
import User from '../models/User';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  resendVerificationEmail,
} from './emailService';

interface RegisterParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
}

/**
 * Generate JWT token for a user
 */
const generateToken = (userId: string, email: string, role: string): string => {
  const expiresIn =
    typeof config.JWT_EXPIRES_IN === 'string'
      ? config.JWT_EXPIRES_IN
      : Number(config.JWT_EXPIRES_IN);

  return jwt.sign(
    { userId, email, role },
    config.JWT_SECRET as string,
    { expiresIn } as any
  );
};

/**
 * Convert user document to response format
 */
const formatUserResponse = (user: any): UserResponse => {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
};

/**
 * Register a new user
 */
export const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
}: RegisterParams) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const user = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    isEmailVerified: false,
    verificationToken,
    verificationTokenExpiry,
  });

  await user.save();

  // Send verification email
  try {
    await sendVerificationEmail(email, firstName, verificationToken);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    // Continue with registration even if email fails
  }

  return {
    user: formatUserResponse(user),
    requiresVerification: true,
  };
};

/**
 * Login a user
 */
export const loginUser = async ({ email, password }: LoginParams) => {
  // Find user
  const user = await User.findOne({
    email,
    isDeleted: { $ne: true },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Check if JWT_SECRET exists
  if (!config.JWT_SECRET) {
    throw new Error('Server configuration error');
  }

  // Check email verification
  if (!user.isEmailVerified) {
    return {
      success: false,
      code: 'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email before logging in.',
      user: formatUserResponse(user),
      token: null,
      requiresVerification: true,
    };
  }

  // Generate token
  const token = generateToken(user._id.toString(), user.email, user.role);

  return {
    success: true,
    message: 'Login successful',
    token,
    user: formatUserResponse(user),
    requiresVerification: false,
  };
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token: string) => {
  // Find user with this verification token
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() }, // Token not expired
  });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  // Check if already verified
  if (user.isEmailVerified) {
    const authToken = generateToken(user._id.toString(), user.email, user.role);
    return {
      success: true,
      message: 'Email is already verified',
      token: authToken,
      user: formatUserResponse(user),
      alreadyVerified: true,
    };
  }

  // Update user
  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  // Generate token
  const authToken = generateToken(user._id.toString(), user.email, user.role);

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.firstName);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  return {
    success: true,
    message: 'Email verified successfully',
    token: authToken,
    user: formatUserResponse(user),
    alreadyVerified: false,
  };
};

/**
 * Resend verification email
 */
export const resendVerification = async (userId?: string, email?: string) => {
  let user;

  // Get user by ID or email
  if (userId) {
    user = await User.findById(userId);
  } else if (email) {
    user = await User.findOne({ email });
    // Don't reveal if email exists or not (security best practice)
    if (!user) {
      return {
        success: true,
        message: 'If that email exists and is unverified, a verification email has been sent',
        emailSent: false,
      };
    }
  } else {
    throw new Error('Authentication token or email required');
  }

  if (!user) {
    throw new Error('User not found');
  }

  // Check if already verified
  if (user.isEmailVerified) {
    throw new Error('Email is already verified');
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = verificationTokenExpiry;
  await user.save();

  // Resend verification email
  await resendVerificationEmail(user.email, user.firstName, verificationToken);

  return {
    success: true,
    message: 'Verification email resent successfully',
    emailSent: true,
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return formatUserResponse(user);
};