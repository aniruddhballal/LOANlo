import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';
import validator from 'validator';
import { isProfileComplete, UserProfile } from '../shared/validation';
import { logProfileChange, getProfileHistory } from '../middleware/profileAudit';
import LoanApplication from '../models/LoanApplication';

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
  keyGenerator: (req: AuthRequest) => {
    // If authenticated, rate limit by userId (most secure)
    // If not authenticated, return undefined to use express-rate-limit's default IP handling
    // The default handler properly handles IPv6 addresses
    if (req.user?.userId) {
      return `user:${req.user.userId}`;
    }
    return undefined as any;
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
  keyGenerator: (req: AuthRequest) => {
    // Same approach: userId for authenticated, default IP handling for unauthenticated
    if (req.user?.userId) {
      return `user:${req.user.userId}`;
    }
    return undefined as any;
  }
});

// Input validation middleware to detect malicious patterns
const validateProfileInput = (req: Request, res: Response, next: Function) => {
  const {
    firstName, lastName, dateOfBirth, gender, maritalStatus,
    aadhaarNumber, panNumber, email, phone, address, city, state, pincode,
    employmentType, companyName, designation, workExperience, monthlyIncome
  } = req.body;

  // Suspicious patterns that could indicate attacks
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi, // Script tags
    /<iframe[^>]*>.*?<\/iframe>/gi, // Iframe tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers (onclick, onload, etc.)
    /union\s+select/gi, // SQL injection
    /drop\s+table/gi, // SQL injection
    /insert\s+into/gi, // SQL injection
    /delete\s+from/gi, // SQL injection
    /update\s+set/gi, // SQL injection
    /\$\{.*\}/g, // Template literal injection
    /\{\{.*\}\}/g, // Template injection
    /%3Cscript/gi, // URL encoded script tags
    /&lt;script/gi, // HTML encoded script tags
  ];

  // Text fields to validate
  const textFields = [
    firstName, lastName, gender, maritalStatus, address, 
    city, state, employmentType, companyName, designation
  ];

  for (const field of textFields) {
    if (typeof field === 'string') {
      // Check for suspicious patterns
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(field)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid input detected. Please remove special characters and try again.'
          });
        }
      }

      // Check for excessively long inputs (potential DoS)
      if (field.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Input too long. Please limit text fields to 500 characters.'
        });
      }

      // Check for null bytes (can cause issues in some systems)
      if (field.includes('\0')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid characters detected.'
        });
      }
    }
  }

  // Validate numeric inputs
  if (workExperience !== undefined && workExperience !== null) {
    const workExp = Number(workExperience);
    if (isNaN(workExp) || workExp < 0 || workExp > 100) {
      return res.status(400).json({
        success: false,
        message: 'Work experience must be between 0 and 100 years.'
      });
    }
  }

  if (monthlyIncome !== undefined && monthlyIncome !== null) {
    const income = Number(monthlyIncome);
    if (isNaN(income) || income < 0 || income > 100000000) {
      return res.status(400).json({
        success: false,
        message: 'Monthly income must be a valid positive number.'
      });
    }
  }

  // Additional validation for structured fields
  if (email && email.length > 254) {
    return res.status(400).json({
      success: false,
      message: 'Email address too long.'
    });
  }

  if (phone && phone.length > 15) {
    return res.status(400).json({
      success: false,
      message: 'Phone number too long.'
    });
  }

  next();
};

// Save or update profile details
router.post('/save', profileUpdateLimiter, validateProfileInput, authenticateToken, async (req: AuthRequest, res: Response) => {
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

    // ONLY validate fields that have been provided (non-empty)
    
    // Aadhaar validation - only if provided
    if (aadhaarNumber && aadhaarNumber.trim() !== '' && !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number format. It must be 12 digits.'
      });
    }

    // PAN validation - only if provided
    if (panNumber && panNumber.trim() !== '' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN number format. Example: ABCDE1234F'
      });
    }

    // Email validation - only if provided
    if (email && email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Phone validation - only if provided
    if (phone && phone.trim() !== '' && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    // Pincode validation - only if provided
    if (pincode && pincode.trim() !== '' && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format'
      });
    }

    // Age validation (18+ for loans) - only if provided
    if (sanitizedData.dateOfBirth && sanitizedData.dateOfBirth.trim() !== '') {
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

    // Income validation - only if provided
    const monthlyIncomeNum = Number(sanitizedData.monthlyIncome);
    if (
      sanitizedData.monthlyIncome != null &&
      !isNaN(monthlyIncomeNum) && // If it's a valid number, then validate range
      monthlyIncomeNum !== 0 && // Allow 0 as "not provided"
      (monthlyIncomeNum < 1000 || monthlyIncomeNum > 10000000)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid income range'
      });
    }

    // Work experience validation - only if provided
    const workExpNum = Number(sanitizedData.workExperience);
    if (
      sanitizedData.workExperience != null &&
      !isNaN(workExpNum) &&
      workExpNum < 0
    ) {
      return res.status(400).json({ success: false, message: 'Invalid work experience' });
    }

    const oldUser = await User.findById(userId).lean();
    
    if (!oldUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only update fields that are provided (not empty)
    const updateData: any = {};
    Object.keys(sanitizedData).forEach(key => {
      const value = sanitizedData[key as keyof UserProfile];
      // Only include non-empty values or explicitly set numbers
      if (value !== '' && value !== null && value !== undefined) {
        updateData[key] = value;
      }
    });

    // Update user in DB
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Mark profile complete using shared validation
    if (isProfileComplete(user) && !user.isProfileComplete) {
      user.isProfileComplete = true;
      await user.save();
    }

    // Log the profile changes asynchronously (non-blocking)
    logProfileChange(userId, oldUser, user.toObject(), req).catch(err => {
      console.error('Profile audit logging failed:', err);
    });

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

router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const history = await getProfileHistory(userId, limit);

    res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile history',
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

// Get any user's profile details by userId (for underwriter to viewing other users' profiles)
router.get('/:userId', profileFetchLimiter, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;
    const requestingUserRole = req.user?.role;

    // Only allow underwriters to view other users' profiles
    // Users can always view their own profile via /me endpoint
    if (requestingUserRole !== 'underwriter' && requestingUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only underwriters can view other users\' profiles.'
      });
    }

    // Validate userId format (basic MongoDB ObjectId validation)
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is soft deleted
    if (user.isDeleted) {
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

// Soft delete user account WITH cascading delete to loan applications
router.delete('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already deleted
    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Account is already deleted'
      });
    }

    // Perform soft delete on user
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    // CASCADE: Soft delete all loan applications by this user
    // Find all non-deleted loan applications
    const userLoanApplications = await LoanApplication.find({ 
      userId: userId,
      isDeleted: { $ne: true }
    });

    // Soft delete each application and add to status history
    for (const application of userLoanApplications) {
      application.isDeleted = true;
      application.deletedAt = new Date();
      
      // Add to status history
      application.statusHistory.push({
        status: application.status, // Keep current status
        timestamp: new Date(),
        comment: 'Application deleted because user account was deleted',
        updatedBy: userId.toString()
      });
      
      await application.save();
    }

    res.json({
      success: true,
      message: 'Account deleted successfully',
      cascadedApplications: userLoanApplications.length
    });
  } catch (err: any) {
    console.error('Error deleting account:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: err.message
    });
  }
});

// Restore deleted user account WITH cascading restore to loan applications
router.post('/restore/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Admin access required.'
      });
    }

    const { userId } = req.params;

    // Find user including soft-deleted ones
    const user = await User.findOne({ _id: userId, isDeleted: true }).exec();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Account is not deleted'
      });
    }

    // Restore the user account
    user.isDeleted = false;
    user.deletedAt = undefined;
    await user.save();

    // CASCADE: Restore loan applications that were deleted BECAUSE the user was deleted
    // Find deleted applications where the last status history comment indicates user deletion
    const deletedApplications = await LoanApplication.find({ 
      userId: userId,
      isDeleted: true
    });

    let restoredCount = 0;

    for (const application of deletedApplications) {
      // Check if the most recent status history entry is about user deletion
      const lastHistoryEntry = application.statusHistory[application.statusHistory.length - 1];
      
      // Only restore if it was deleted due to user account deletion
      if (lastHistoryEntry?.comment === 'Application deleted because user account was deleted') {
        application.isDeleted = false;
        application.deletedAt = undefined;
        
        // Add restoration to status history
        application.statusHistory.push({
          status: application.status, // Keep the status before deletion
          timestamp: new Date(),
          comment: 'Application restored because user account was restored',
          updatedBy: req.user?.userId?.toString() || 'Unknown'
        });
        
        await application.save();
        restoredCount++;
      }
      // If the comment is "Application deleted by user", we DON'T restore it
    }

    res.json({
      success: true,
      message: 'Account restored successfully',
      user,
      restoredApplications: restoredCount
    });
  } catch (err: any) {
    console.error('Error restoring account:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to restore account',
      error: err.message
    });
  }
});

// Add these two endpoints to: backend/src/routes/profile.ts
// Place them near your existing restore and soft delete endpoints

// Get all deleted users (admin only)
router.get('/admin/deleted-users', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Admin access required.'
      });
    }

    // Find ONLY soft-deleted users (isDeleted: true)
    const deletedUsers = await User.find({ isDeleted: true })
      .select('firstName lastName email phone role isDeleted deletedAt createdAt employmentType companyName monthlyIncome city state designation')
      .sort({ deletedAt: -1 }) // Most recently deleted first
      .exec();

    res.json({
      success: true,
      users: deletedUsers,
      count: deletedUsers.length
    });
  } catch (err: any) {
    console.error('Error fetching deleted users:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deleted users',
      error: err.message
    });
  }
});

// Get all users (both active and deleted) - admin only
router.get('/admin/all-users', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Admin access required.'
      });
    }

    // Find ALL users (including soft-deleted ones)
    const allUsers = await User.find({})
      .select('firstName lastName email phone role isDeleted deletedAt createdAt employmentType companyName monthlyIncome city state designation')
      .sort({ createdAt: -1 }) // Most recently created first
      .exec();

    res.json({
      success: true,
      users: allUsers,
      count: allUsers.length
    });
  } catch (err: any) {
    console.error('Error fetching all users:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all users',
      error: err.message
    });
  }
});

// Permanently delete a user (admin only)
router.delete('/admin/permanent-delete/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Admin access required.'
      });
    }

    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId).exec();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is soft-deleted
    if (!user.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'User account is not deleted. Cannot permanently delete an active account.'
      });
    }

    // Optional: Delete all associated loan applications
    // Uncomment if you want to delete user's applications too
    // const LoanApplication = require('../models/LoanApplication'); // Add import if needed
    // await LoanApplication.deleteMany({ userId: userId });

    // Permanently delete the user from the database
    await User.findByIdAndDelete(userId);

    // Log the permanent deletion for audit purposes
    res.json({
      success: true,
      message: 'User permanently deleted from the system',
      deletedUser: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      }
    });
  } catch (err: any) {
    console.error('Error permanently deleting user:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete user',
      error: err.message
    });
  }
});

export default router;