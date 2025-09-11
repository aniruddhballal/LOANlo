import { Router, Request, Response } from 'express';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';
import validator from 'validator';

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

    // Input sanitization + numeric coercion
    const sanitizedData = {
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
      workExperience: isNaN(Number(workExperience)) ? null : Number(workExperience),
      monthlyIncome: isNaN(Number(monthlyIncome)) ? null : Number(monthlyIncome)
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
    if (
      sanitizedData.monthlyIncome !== null &&
      (sanitizedData.monthlyIncome < 1000 ||
      sanitizedData.monthlyIncome > 10000000)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid income range'
      });
    }

    const profileUpdateData: Record<string, unknown> = sanitizedData;

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