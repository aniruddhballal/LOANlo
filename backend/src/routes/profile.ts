import { Router, Request, Response } from 'express';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Save or update profile details
router.post('/save', authenticateToken, async (req: AuthRequest, res: Response) => {
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

    if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number format. It must be 12 digits.'
      });
    }

    if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN number format. Example: ABCDE1234F'
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    if (pincode && !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format'
      });
    }

    const profileUpdateData: Record<string, unknown> = {
      firstName, lastName, dateOfBirth, gender, maritalStatus,
      aadhaarNumber, panNumber, email, phone, address, city, state, pincode,
      employmentType, companyName, designation, workExperience, monthlyIncome
    };

    // Remove undefined fields
    Object.keys(profileUpdateData).forEach(
      key => profileUpdateData[key] === undefined && delete profileUpdateData[key]
    );

    const user = await User.findByIdAndUpdate(
      userId,
      profileUpdateData,
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Enhanced profile completion check that matches frontend validation
    const isProfileComplete = (userData: any): boolean => {
      // Check all required fields are present and not empty
      const requiredFields = [
        'firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus',
        'aadhaarNumber', 'panNumber', 'email', 'phone', 'address', 'city', 
        'state', 'pincode', 'employmentType', 'companyName', 'designation', 
        'workExperience', 'monthlyIncome'
      ];

      const allFieldsPresent = requiredFields.every(field => {
        const value = userData[field]?.toString().trim();
        return value !== '' && value !== undefined && value !== null;
      });

      if (!allFieldsPresent) return false;

      // Apply same format validations as frontend
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email || '');
      const phoneValid = /^[6-9]\d{9}$/.test(userData.phone || '');
      const pincodeValid = /^\d{6}$/.test(userData.pincode || '');
      const aadhaarValid = /^\d{12}$/.test(userData.aadhaarNumber || '');
      const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(userData.panNumber || '');
      const workExperienceValid = Number(userData.workExperience) >= 0;
      const monthlyIncomeValid = Number(userData.monthlyIncome) > 0;

      return emailValid && phoneValid && pincodeValid && aadhaarValid && 
            panValid && workExperienceValid && monthlyIncomeValid;
    };

    // Use the new validation function
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
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
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