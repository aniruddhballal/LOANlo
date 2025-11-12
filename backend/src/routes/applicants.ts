import {Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken, requireRole} from '../middleware/auth';

import User from '../models/User';

const router = Router();
// Apply middleware to ALL routes
router.use(authenticateToken);
router.use(requireRole('system_admin'));

// Get all applicant users (system_admin only)
router.get(
  '/all',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Fetch all applicants (non-deleted, role = applicant)
      const applicants = await User.find({
        role: 'applicant',
        isDeleted: false
      })
      .select('-password -verificationToken -verificationTokenExpiry -ipWhitelist')
      .sort({ createdAt: -1 })
      .lean();

      res.json({
        success: true,
        count: applicants.length,
        applicants
      });
    } catch (error: any) {
      console.error('Error fetching applicants:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applicants',
        error: error.message
      });
    }
  }
);

export default router;