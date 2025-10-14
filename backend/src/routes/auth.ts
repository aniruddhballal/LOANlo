import express, { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import config from '../config';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { sendVerificationEmail, sendWelcomeEmail, resendVerificationEmail } from '../services/emailService';

// Define interface for authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

// Interface for captcha attempt tracking
interface CaptchaAttempt {
  ip: string;
  sessionCount: number;
  totalAttempts: number;
  firstAttempt: Date;
  lastAttempt: Date;
}

const router = express.Router();

// In-memory store for captcha rate limiting (use Redis in production)
const captchaAttempts = new Map<string, CaptchaAttempt>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  for (const [ip, attempt] of captchaAttempts.entries()) {
    if (attempt.firstAttempt < fiveMinutesAgo) {
      captchaAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Rate limiting configurations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for login attempts
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  message: {
    error: 'Too many registration attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // More lenient for token verification
  message: {
    error: 'Too many verification requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // <-- skip preflight
});

const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit to 3 resend attempts per hour
  message: {
    error: 'Too many resend attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Captcha rate limiter middleware
const captchaRateLimiter = (req: Request, res: Response, next: express.NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  let attempt = captchaAttempts.get(clientIP);

  // If no previous attempt or it's been more than 5 minutes, reset
  if (!attempt || attempt.firstAttempt < fiveMinutesAgo) {
    attempt = {
      ip: clientIP,
      sessionCount: 0,
      totalAttempts: 0,
      firstAttempt: now,
      lastAttempt: now
    };
    captchaAttempts.set(clientIP, attempt);
  }

  // Check if user has exceeded the limit (3 sessions * 3 attempts = 9 total attempts)
  if (attempt.totalAttempts >= 9) {
    const timeRemaining = Math.ceil((attempt.firstAttempt.getTime() + 5 * 60 * 1000 - now.getTime()) / 1000);
    return res.status(429).json({
      error: 'Captcha rate limit exceeded',
      message: `Too many captcha attempts. Please try again in ${Math.ceil(timeRemaining / 60)} minutes.`,
      retryAfter: timeRemaining,
      rateLimited: true
    });
  }

  // Add current attempt info to request for use in routes
  (req as any).captchaAttempt = attempt;
  next();
};

// Helper function to update captcha attempts
const updateCaptchaAttempts = (clientIP: string, isNewSession: boolean = false, failed: boolean = false) => {
  let attempt = captchaAttempts.get(clientIP);
  if (attempt) {
    if (isNewSession) {
      attempt.sessionCount++;
    }
    if (failed) {
      attempt.totalAttempts++;
    }
    attempt.lastAttempt = new Date();
    captchaAttempts.set(clientIP, attempt);
  }
};

// Captcha verification endpoint
router.post('/captcha/verify', captchaRateLimiter, async (req: Request, res: Response) => {
  try {
    const { answer, num1, num2, operator, isNewSession = false } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    // Input validation
    if (answer === undefined || num1 === undefined || num2 === undefined || !operator) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required captcha data' 
      });
    }

    // Calculate correct answer
    let correctAnswer: number;
    switch (operator) {
      case '+':
        correctAnswer = num1 + num2;
        break;
      case '-':
        correctAnswer = num1 - num2;
        break;
      case '*':
        correctAnswer = num1 * num2;
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid operator' 
        });
    }

    const userAnswer = parseInt(answer);
    const isCorrect = userAnswer === correctAnswer;

    // Update attempt tracking
    updateCaptchaAttempts(clientIP, isNewSession, !isCorrect);

    const attempt = captchaAttempts.get(clientIP);
    const remainingAttempts = 9 - (attempt?.totalAttempts || 0);

    if (isCorrect) {
      res.json({
        success: true,
        message: 'Captcha verified successfully',
        remainingAttempts
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Incorrect answer',
        remainingAttempts: Math.max(0, remainingAttempts)
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error during captcha verification', 
      error: error.message 
    });
  }
});

// Get captcha rate limit status
router.get('/captcha/status', (req: Request, res: Response) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const attempt = captchaAttempts.get(clientIP);
  const now = new Date();
  
  if (!attempt) {
    return res.json({
      totalAttempts: 0,
      remainingAttempts: 9,
      sessionCount: 0,
      rateLimited: false,
      timeRemaining: 0
    });
  }

  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const isExpired = attempt.firstAttempt < fiveMinutesAgo;
  
  if (isExpired) {
    captchaAttempts.delete(clientIP);
    return res.json({
      totalAttempts: 0,
      remainingAttempts: 9,
      sessionCount: 0,
      rateLimited: false,
      timeRemaining: 0
    });
  }

  const remainingAttempts = Math.max(0, 9 - attempt.totalAttempts);
  const rateLimited = attempt.totalAttempts >= 9;
  const timeRemaining = rateLimited 
    ? Math.ceil((attempt.firstAttempt.getTime() + 5 * 60 * 1000 - now.getTime()) / 1000)
    : 0;

  res.json({
    totalAttempts: attempt.totalAttempts,
    remainingAttempts,
    sessionCount: attempt.sessionCount,
    rateLimited,
    timeRemaining: Math.max(0, timeRemaining)
  });
});

// Register with rate limiting and email verification
router.post('/register', registerLimiter, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
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


    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      requiresVerification: true,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify email endpoint
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Verification token is required' 
      });
    }

    // Find user with this verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // Token not expired
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired verification token' 
      });
    }

    // Check if already verified - RETURN SUCCESS INSTEAD OF ERROR
    if (user.isEmailVerified) {
      return res.status(200).json({ 
        success: true,
        message: 'Email is already verified',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: 'Server error during verification', 
      error: error.message 
    });
  }
});

// Resend verification email
router.post('/resend-verification', resendVerificationLimiter, async (req: Request, res: Response) => {
  try {
    let user;
    
    // Check if user is authenticated (has token)
    if ((req as AuthenticatedRequest).user?.userId) {
      // Authenticated request - get user from token
      user = await User.findById((req as AuthenticatedRequest).user.userId);
    } else if (req.body.email) {
      // Unauthenticated request - get user from email in body
      user = await User.findOne({ email: req.body.email });
      
      // Don't reveal if email exists or not (security best practice)
      if (!user) {
        return res.json({
          success: true,
          message: 'If that email exists and is unverified, a verification email has been sent',
        });
      }
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Authentication token or email required' 
      });
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is already verified' 
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Resend verification email
    await resendVerificationEmail(user.email, user.firstName, verificationToken);

    res.json({
      success: true,
      message: 'Verification email resent successfully',
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to resend verification email', 
      error: error.message 
    });
  }
});

// Login with rate limiting
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!config.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Check email verification BEFORE calculating expiresIn
    if (!user.isEmailVerified) {
      return res.status(200).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before logging in.',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        }
      });
    }

    // Only calculate expiresIn if we're creating a token
    const expiresIn =
      typeof config.JWT_EXPIRES_IN === 'string' ? config.JWT_EXPIRES_IN : Number(config.JWT_EXPIRES_IN);

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.JWT_SECRET as string,
      { expiresIn } as any
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      requiresVerification: !user.isEmailVerified,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token with rate limiting
router.get(
  '/verify',
  verifyLimiter,
  authenticateToken,
  (async (req, res) => {
    const user = await User.findById((req as AuthenticatedRequest).user?.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  }) as RequestHandler
);

export default router;