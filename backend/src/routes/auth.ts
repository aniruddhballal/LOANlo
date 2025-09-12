import express, { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import config from '../config';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

// Define interface for authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

const router = express.Router();

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
});

// Register with rate limiting
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
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });

    await user.save();

    const expiresIn =
      typeof config.JWT_EXPIRES_IN === 'string' ? config.JWT_EXPIRES_IN : Number(config.JWT_EXPIRES_IN);

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.JWT_SECRET as string,
      { expiresIn } as any
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
      },
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
      },
    });
  }) as RequestHandler
);

export default router;