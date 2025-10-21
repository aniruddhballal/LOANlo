import { Request, Response } from 'express';
import { verifyCaptcha, getCaptchaStatus } from '../services/captchaService';
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  getUserById,
} from '../services/authService';
import { getClientIP, normalizeIP } from '../middleware/ipWhitelist';
import User from '../models/User';

// Define interface for authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Verify captcha answer
 */
export const verifyCaptchaController = async (req: Request, res: Response) => {
  try {
    const { answer, num1, num2, operator, isNewSession = false } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    // Input validation
    if (answer === undefined || num1 === undefined || num2 === undefined || !operator) {
      return res.status(400).json({
        success: false,
        message: 'Missing required captcha data',
      });
    }

    const userAnswer = parseInt(answer);
    const result = verifyCaptcha({
      answer: userAnswer,
      num1,
      num2,
      operator,
      clientIP,
      isNewSession,
    });

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        remainingAttempts: result.remainingAttempts,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        remainingAttempts: result.remainingAttempts,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error during captcha verification',
      error: error.message,
    });
  }
};

/**
 * Get captcha rate limit status
 */
export const getCaptchaStatusController = (req: Request, res: Response) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const status = getCaptchaStatus(clientIP);
  res.json(status);
};

/**
 * Register a new user
 */
export const registerController = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const result = await registerUser({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: result.user,
      requiresVerification: result.requiresVerification,
    });
  } catch (error: any) {
    if (error.message === 'User already exists with this email') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Login user
 */
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await loginUser({ email, password });

    if (!result.success && result.code === 'EMAIL_NOT_VERIFIED') {
      return res.status(200).json({
        success: false,
        code: result.code,
        message: result.message,
        user: result.user,
      });
    }

    const user = await User.findById(result.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Enforce IP restriction for system_admin
    if (user.role === 'system_admin' && user.allowIpRestriction) {
  const clientIP = normalizeIP(getClientIP(req));

  console.log('Client IP:', clientIP);
  console.log('IP Whitelist:', user.ipWhitelist.map((item: any) => normalizeIP(item.ip)));

  const isAllowed = user.ipWhitelist.some(
    (item: any) => normalizeIP(item.ip) === clientIP
  );

  if (!isAllowed) {
    console.warn(`IP whitelist violation: User ${user.email} attempted login from ${clientIP}`);
    return res.status(401).json({
      success: false,
      message: 'Access denied: Your IP address is not whitelisted',
      currentIp: clientIP,
      code: 'IP_NOT_WHITELISTED',
    });
  }
}

    res.json({
      success: true,
      message: result.message,
      token: result.token,
      user: result.user,
      requiresVerification: result.requiresVerification,
    });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Server configuration error') {
      return res.status(500).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Verify email with token
 */
export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    const result = await verifyEmail(token);

    res.status(200).json({
      success: result.success,
      message: result.message,
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    if (error.message === 'Invalid or expired verification token') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: error.message,
    });
  }
};

/**
 * Resend verification email
 */
export const resendVerificationController = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.userId;
    const email = req.body.email;

    const result = await resendVerification(userId, email);

    res.json({
      success: result.success,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message === 'Authentication token or email required') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === 'Email is already verified') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message,
    });
  }
};

/**
 * Verify JWT token and return user
 */
export const verifyTokenController = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.userId;
    const user = await getUserById(userId);

    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};