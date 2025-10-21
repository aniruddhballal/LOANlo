import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Extract client IP from request
 * Handles proxies, load balancers, and direct connections
 */
const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  const real = req.headers['x-real-ip'];

  const ip =
    (Array.isArray(real)
      ? real[0]
      : typeof real === 'string'
      ? real
      : Array.isArray(forwarded)
      ? forwarded[0]
      : typeof forwarded === 'string'
      ? forwarded.split(',')[0]
      : req.socket.remoteAddress) || 'unknown';

  return ip.trim();
};

/**
 * Normalize IPv6 addresses to IPv4 if they are IPv4-mapped
 * Example: ::ffff:192.168.1.1 becomes 192.168.1.1
 */
const normalizeIP = (ip: string): string => {
  // Remove IPv6 prefix for IPv4-mapped addresses
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  return ip;
};

/**
 * Middleware to check if system_admin user is accessing from whitelisted IP
 * Only applies if user has IP restriction enabled
 */
export const checkIpWhitelist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;

    // Only check for authenticated users
    if (!authReq.user?.userId) {
      return next();
    }

    const user = await User.findById(authReq.user.userId);

    if (!user) {
      res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
      return;
    }

    // Only enforce IP whitelist for system_admin with restriction enabled
    if (user.role === 'system_admin' && user.allowIpRestriction) {
      const clientIP = normalizeIP(getClientIP(req));

      // Check if IP is whitelisted
      const isAllowed = user.ipWhitelist.some(
        (item: any) => normalizeIP(item.ip) === clientIP
      );

      if (!isAllowed) {
        // Log the failed attempt
        console.warn(`IP whitelist violation: User ${user.email} attempted access from ${clientIP}`);

        res.status(403).json({
          success: false,
          message: 'Access denied: Your IP address is not whitelisted',
          currentIp: clientIP,
          code: 'IP_NOT_WHITELISTED',
        });
        return;
      }

      // Log successful access
      console.log(`IP whitelist check passed: User ${user.email} from ${clientIP}`);
    }

    next();
  } catch (error: any) {
    console.error('IP whitelist check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking IP whitelist',
      error: error.message,
    });
  }
};

/**
 * Utility function to get client IP (can be used in controllers)
 */
export { getClientIP, normalizeIP };