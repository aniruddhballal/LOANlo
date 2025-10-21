import { Request, Response } from 'express';
import {
  addIpToWhitelist,
  removeIpFromWhitelist,
  getIpWhitelist,
  toggleIpRestriction,
  validateIpAddress,
} from '../services/ipWhitelistService';
import { getClientIP } from '../middleware/ipWhitelist';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Get current client IP
 */
export const getCurrentIp = (req: Request, res: Response) => {
  let clientIP = getClientIP(req); // e.g., "::ffff:127.0.0.1"
  if (clientIP.startsWith('::ffff:')) {
    clientIP = clientIP.replace('::ffff:', '');
  }
  res.json({
    success: true,
    ip: clientIP,
  });
};


/**
 * Add IP to whitelist
 */
export const addIp = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { ip, description } = req.body;

    // Input validation
    if (!ip) {
      return res.status(400).json({
        success: false,
        message: 'IP address is required',
      });
    }

    // Validate IP format
    if (!validateIpAddress(ip)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IP address format',
      });
    }

    const result = await addIpToWhitelist({
      userId: authReq.user.userId,
      ip,
      description,
      addedBy: authReq.user.userId,
    });

    res.json(result);
  } catch (error: any) {
    if (
      error.message === 'User not found' ||
      error.message === 'IP address already whitelisted'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === 'IP whitelisting is only available for system administrators') {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to add IP to whitelist',
      error: error.message,
    });
  }
};

/**
 * Remove IP from whitelist
 */
export const removeIp = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { ipId } = req.params;

    if (!ipId) {
      return res.status(400).json({
        success: false,
        message: 'IP ID is required',
      });
    }

    const result = await removeIpFromWhitelist({
      userId: authReq.user.userId,
      ipId,
    });

    res.json(result);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to remove IP from whitelist',
      error: error.message,
    });
  }
};

/**
 * Get IP whitelist
 */
export const getWhitelist = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const result = await getIpWhitelist(authReq.user.userId);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to get IP whitelist',
      error: error.message,
    });
  }
};

/**
 * Toggle IP restriction on/off
 */
export const toggleRestriction = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { enable } = req.body;

    if (typeof enable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Enable parameter must be a boolean',
      });
    }

    const result = await toggleIpRestriction(authReq.user.userId, enable);
    res.json(result);
  } catch (error: any) {
    if (
      error.message === 'User not found' ||
      error.message === 'Cannot enable IP restriction without at least one whitelisted IP'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === 'IP restriction is only available for system administrators') {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to toggle IP restriction',
      error: error.message,
    });
  }
};