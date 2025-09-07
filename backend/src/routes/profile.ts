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
      aadhaarNumber, panNumber, phone, address, city, state, pincode,
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
        message: 'Invalid PAN number format. Example: AAAPA1234A'
      });
    }

    const profileUpdateData: Record<string, unknown> = {
      firstName, lastName, dateOfBirth, gender, maritalStatus,
      aadhaarNumber, panNumber, phone, address, city, state, pincode,
      employmentType, companyName, designation, workExperience, monthlyIncome
    };

    // Remove undefined fields
    Object.keys(profileUpdateData).forEach(
      key => profileUpdateData[key] === undefined && delete profileUpdateData[key]
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      profileUpdateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: updatedUser,
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

// Clear profile details
router.delete('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const profileFields = {
      dateOfBirth: null,
      gender: null,
      maritalStatus: null,
      aadhaarNumber: null,
      panNumber: null,
      address: null,
      city: null,
      state: null,
      pincode: null,
      employmentType: null,
      companyName: null,
      designation: null,
      workExperience: null,
      monthlyIncome: null
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.userId,
      profileFields,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true, message: 'Profile details cleared successfully' });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear profile details',
      error: err.message
    });
  }
});

export default router;