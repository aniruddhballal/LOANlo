import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';
import validator from 'validator';
import { isProfileComplete, UserProfile } from '../../../shared/validation';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Rate limiting middleware for profile updates
const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each user to 5 profile updates per 15 minutes
  message: {
    success: false,
    message: 'Too many profile update attempts. Please try again in 15 minutes.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  keyGenerator: (req: AuthRequest) : string => {
    // Rate limit per user ID instead of IP to prevent circumvention
    return req.user?.userId ?? req.ip ?? "unknown";
  },
  skipSuccessfulRequests: false, // Count all attempts, not just failed ones
  skipFailedRequests: false
});

// Rate limiting for profile fetch (more lenient)
const profileFetchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for profile fetching
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  keyGenerator: (req: AuthRequest): string => {
    return req.user?.userId ?? req.ip ?? "unknown";
  }
});

// Save or update profile details
router.post('/save', profileUpdateLimiter, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      firstName, lastName, dateOfBirth, gender, maritalStatus,
      aadhaarNumber, panNumber, email, phone, address, city, state, pincode,
      employmentType, companyName, designation, workExperience, monthlyIncome
    } = req.body;

    // Input sanitization + numeric coercion
    const sanitizedData: UserProfile = {
      firstName: validator.escape(firstName?.trim() || ''),
      lastName: validator.escape(lastName?.trim() || ''),
      dateOfBirth: dateOfBirth?.trim() || '',
      gender: validator.escape(gender?.trim() || ''),
      maritalStatus: validator.escape(maritalStatus?.trim() || ''),
      aadhaarNumber: aadhaarNumber?.trim() || '',
      panNumber: panNumber?.trim() || '',
      email: validator.normalizeEmail(email?.trim() || '') || '',
      phone: phone?.trim() || '',
      address: validator.escape(address?.trim() || ''),
      city: validator.escape(city?.trim() || ''),
      state: validator.escape(state?.trim() || ''),
      pincode: pincode?.trim() || '',
      employmentType: validator.escape(employmentType?.trim() || ''),
      companyName: validator.escape(companyName?.trim() || ''),
      designation: validator.escape(designation?.trim() || ''),
      // to ensure that the numeric fields are actually numbers
      workExperience: isNaN(Number(workExperience)) ? undefined : Number(workExperience),
      monthlyIncome: isNaN(Number(monthlyIncome)) ? undefined : Number(monthlyIncome),
    };

    // Aadhaar validation
    if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number format. It must be 12 digits.'
      });
    }

    // PAN validation
    if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN number format. Example: ABCDE1234F'
      });
    }

    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Phone validation
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Pincode validation
    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format'
      });
    }

    // Age validation (18+ for loans)
    if (sanitizedData.dateOfBirth) {
      const birthDate = new Date(sanitizedData.dateOfBirth);

      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date of birth format' });
      }

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        return res.status(400).json({
          success: false,
          message: 'Must be 18 or older'
        });
      }
    }

    // Income validation (reasonable bounds)
    const monthlyIncomeNum = Number(sanitizedData.monthlyIncome);
    if (
      sanitizedData.monthlyIncome != null &&
      (isNaN(monthlyIncomeNum) || monthlyIncomeNum < 1000 || monthlyIncomeNum > 10000000)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid income range'
      });
    }

    // Work experience validation
    const workExpNum = Number(sanitizedData.workExperience);
    if (
      sanitizedData.workExperience != null &&
      (isNaN(workExpNum) || workExpNum < 0)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid work experience' });
    }

    // Update user in DB
    const user = await User.findByIdAndUpdate(
      userId,
      sanitizedData,
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Mark profile complete using shared validation
    if (isProfileComplete(user) && !user.isProfileComplete) {
      user.isProfileComplete = true;
      await user.save();
    }

    res.json({
      success: true,
      user,
      isProfileComplete: user.isProfileComplete, // send to frontend
      message: 'Profile details saved successfully'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to save profile details',
      error: err.message
    });
  }
});

// Get user's profile details
router.get('/me', profileFetchLimiter, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile details',
      error: err.message
    });
  }
});

export default router;