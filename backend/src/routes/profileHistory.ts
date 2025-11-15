import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import ProfileHistory from '../models/ProfileHistory';
import { authenticateToken } from '../middleware/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Rate limiting for profile history fetch
const historyFetchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  keyGenerator: (req: AuthRequest) => {
    if (req.user?.userId) {
      return `user:${req.user.userId}`;
    }
    return undefined as any;
  }
});

// Get profile history for a specific user
router.get('/:userId', historyFetchLimiter, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;
    const requestingUserRole = req.user?.role;

    // Authorization: Only underwriters can view others' history, users can view their own
    if (requestingUserRole !== 'underwriter' && requestingUserRole !== 'system_admin' && requestingUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only view your own profile history.'
      });
    }

    // Validate userId format (MongoDB ObjectId validation)
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID format'
        });
    }

    // Optional limit parameter
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Validate limit
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    // Fetch profile history sorted by most recent first
    const history = await ProfileHistory.find({ userId })
      .sort({ timestamp: -1 }) // Most recent first
      .limit(limit)
      .lean()
      .exec();

    res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (err: any) {
    console.error('Error fetching profile history:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile history',
      error: err.message
    });
  }
});

// Get profile history statistics for a user (optional - for analytics)
router.get('/:userId/stats', historyFetchLimiter, authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;
    const requestingUserRole = req.user?.role;

    // Authorization check
    if (requestingUserRole !== 'underwriter' && requestingUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only view your own profile statistics.'
      });
    }

    // Validate userId format
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID format'
        });
    }


    // Get statistics
    const totalChanges = await ProfileHistory.countDocuments({ userId });
    const recentChanges = await ProfileHistory.countDocuments({
      userId,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    
    const firstChange = await ProfileHistory.findOne({ userId })
      .sort({ timestamp: 1 })
      .select('timestamp')
      .lean();
    
    const lastChange = await ProfileHistory.findOne({ userId })
      .sort({ timestamp: -1 })
      .select('timestamp')
      .lean();

    res.json({
      success: true,
      stats: {
        totalChanges,
        recentChanges,
        firstChangeDate: firstChange?.timestamp || null,
        lastChangeDate: lastChange?.timestamp || null
      }
    });
  } catch (err: any) {
    console.error('Error fetching profile history stats:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile history statistics',
      error: err.message
    });
  }
});

export default router;