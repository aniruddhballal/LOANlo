// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';

// Define the shape of your JWT payload
export interface UserPayload extends JwtPayload {
  userId: string;
  role: 'underwriter' | 'system_admin' | 'admin' | 'reviewer' | 'applicant';
}

// Extend Express Request with a strongly-typed user
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// Middleware to verify JWT token
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }

    // decoded is of type string | JwtPayload, so we assert to UserPayload
    req.user = decoded as UserPayload;
    next();
  });
};