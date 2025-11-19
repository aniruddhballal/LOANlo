import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Session from '../models/Session';
import UAParser from 'ua-parser-js';

// Get all active sessions for a user (admin or own sessions)
export const getUserSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;

    if (!requestingUser) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Check if user is viewing their own sessions or is an admin
    if (userId !== requestingUser.userId && requestingUser.role !== 'system_admin') {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view your own sessions.' 
      });
      return;
    }

    const sessions = await Session.find({ 
      userId,
      isActive: true 
    })
      .sort({ lastActivity: -1 })
      .select('-sessionToken'); // Don't expose the actual token

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch sessions' 
    });
  }
};

// Get all sessions for all users (system_admin only)
export const getAllUserSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, userId, isActive } = req.query;

    const query: any = {};
    if (userId) query.userId = userId;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const sessions = await Session.find(query)
      .populate('userId', 'firstName lastName email role')
      .populate('loggedOutBy', 'firstName lastName email')
      .sort({ lastActivity: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-sessionToken');

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      data: sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch sessions' 
    });
  }
};

// Logout from a specific session (user's own or admin)
export const logoutSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const requestingUser = req.user;

    if (!requestingUser) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
      return;
    }

    // Check if user is logging out their own session or is an admin
    const isOwnSession = session.userId.toString() === requestingUser.userId;
    const isAdmin = requestingUser.role === 'system_admin';

    if (!isOwnSession && !isAdmin) {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only logout your own sessions.' 
      });
      return;
    }

    // Update session
    session.isActive = false;
    session.logoutTime = new Date();
    session.logoutReason = isAdmin ? 'admin' : 'user';
    if (isAdmin) {
      session.loggedOutBy = requestingUser.userId as any;
    }
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session terminated successfully'
    });
  } catch (error) {
    console.error('Error logging out session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to terminate session' 
    });
  }
};

// Logout all sessions for a user (admin or own sessions)
export const logoutAllUserSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;

    if (!requestingUser) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Check if user is logging out their own sessions or is an admin
    const isOwnSessions = userId === requestingUser.userId;
    const isAdmin = requestingUser.role === 'system_admin';

    if (!isOwnSessions && !isAdmin) {
      res.status(403).json({ 
        success: false, 
        message: 'Access denied.' 
      });
      return;
    }

    const now = new Date();
    const result = await Session.updateMany(
      { userId, isActive: true },
      { 
        isActive: false,
        logoutTime: now,
        logoutReason: isAdmin ? 'admin' : 'user',
        ...(isAdmin && { loggedOutBy: requestingUser.userId })
      }
    );

    res.status(200).json({
      success: true,
      message: `Successfully terminated ${result.modifiedCount} session(s)`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error logging out all sessions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to terminate sessions' 
    });
  }
};

// Helper function to parse device info
export const parseDeviceInfo = (userAgent: string) => {
  const parser = UAParser(userAgent); // Call as function, not constructor
  
  return {
    userAgent,
    browser: parser.browser.name || 'Unknown',
    os: parser.os.name || 'Unknown',
    device: parser.device.type || 'desktop'
  };
};