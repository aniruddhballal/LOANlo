import express, { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone
    });
    
    await user.save();
    
    // Generate JWT token
    const expiresIn = typeof config.JWT_EXPIRES_IN === 'string' ? config.JWT_EXPIRES_IN : Number(config.JWT_EXPIRES_IN);
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
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('User found, checking password...');
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password valid, generating token...');
    
    // Check if JWT_SECRET exists
    if (!config.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    // Generate JWT token
    const expiresIn = typeof config.JWT_EXPIRES_IN === 'string' ? config.JWT_EXPIRES_IN : Number(config.JWT_EXPIRES_IN);
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.JWT_SECRET as string,
      { expiresIn } as any
    );
    
    console.log('Token generated successfully');
    
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
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token
router.get(
  '/verify',
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
        role: user.role
      }
    });
  }) as RequestHandler
);

export default router;