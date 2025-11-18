// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import User from '../models/User';

// Auto-logout after 15 minutes of inactivity (in milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Define the shape of your JWT payload
export interface UserPayload extends JwtPayload {
  userId: string;
  role: 'underwriter' | 'system_admin' | 'admin' | 'reviewer' | 'applicant';
  firstName?: string;  // this
  lastName?: string;   // this
}

// Extend Express Request with a strongly-typed user
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// Middleware to verify JWT token
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Allow preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, config.JWT_SECRET) as UserPayload;

    // Check if user exists and is not soft-deleted
    const user = await User.findOne({ 
      _id: decoded.userId,
      isDeleted: { $ne: true }
    }).select('_id role isDeleted lastActivity');

    if (!user) {
      res.status(401).json({ 
        success: false,
        message: 'User not found or account has been deleted' 
      });
      return;
    }

    // Check for inactivity timeout
    const now = new Date();
    const lastActivity = user.lastActivity || new Date(0); // Default to epoch if not set
    const inactiveDuration = now.getTime() - lastActivity.getTime();

    if (inactiveDuration > INACTIVITY_TIMEOUT) {
      res.status(401).json({ 
        success: false,
        message: 'Session expired due to inactivity. Please log in again.',
        code: 'SESSION_EXPIRED'
      });
      return;
    }

    // Update last activity timestamp
    await User.updateOne(
      { _id: decoded.userId },
      { $set: { lastActivity: now } }
    );

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};

/**
 * Middleware to check if authenticated user has required role
 * Must be used AFTER authenticateToken middleware
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
      return;
    }

    next();
  };
};