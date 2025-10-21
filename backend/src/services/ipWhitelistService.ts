import User from '../models/User';
import { normalizeIP } from '../middleware/ipWhitelist';
import mongoose from 'mongoose';

interface AddIpParams {
  userId: string;
  ip: string;
  description?: string;
  addedBy: string;
}

interface RemoveIpParams {
  userId: string;
  ipId: string;
}

/**
 * Add IP to user's whitelist
 */
export const addIpToWhitelist = async ({
  userId,
  ip,
  description,
  addedBy,
}: AddIpParams) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Only system_admin can have IP whitelist
  if (user.role !== 'system_admin') {
    throw new Error('IP whitelisting is only available for system administrators');
  }

  // Normalize IP
  const normalizedIp = normalizeIP(ip);

  // Check if IP already exists
  const ipExists = user.ipWhitelist.some(
    (item: any) => normalizeIP(item.ip) === normalizedIp
  );

  if (ipExists) {
    throw new Error('IP address already whitelisted');
  }

  // Add IP to whitelist
  user.ipWhitelist.push({
    ip: normalizedIp,
    description: description || '',
    addedAt: new Date(),
    addedBy: new mongoose.Types.ObjectId(addedBy),
  });

  await user.save();

  return {
    success: true,
    message: 'IP address added to whitelist',
    whitelist: user.ipWhitelist,
  };
};

/**
 * Remove IP from user's whitelist
 */
export const removeIpFromWhitelist = async ({ userId, ipId }: RemoveIpParams) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Remove IP from whitelist
  user.ipWhitelist = user.ipWhitelist.filter(
    (item: any) => item._id.toString() !== ipId
  );

  await user.save();

  return {
    success: true,
    message: 'IP address removed from whitelist',
    whitelist: user.ipWhitelist,
  };
};

/**
 * Get user's IP whitelist
 */
export const getIpWhitelist = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    success: true,
    allowIpRestriction: user.allowIpRestriction,
    whitelist: user.ipWhitelist,
  };
};

/**
 * Toggle IP restriction on/off
 */
export const toggleIpRestriction = async (userId: string, enable: boolean) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Only system_admin can use IP restriction
  if (user.role !== 'system_admin') {
    throw new Error('IP restriction is only available for system administrators');
  }

  // If enabling, ensure at least one IP is whitelisted
  if (enable && user.ipWhitelist.length === 0) {
    throw new Error('Cannot enable IP restriction without at least one whitelisted IP');
  }

  user.allowIpRestriction = enable;
  await user.save();

  return {
    success: true,
    message: `IP restriction ${enable ? 'enabled' : 'disabled'}`,
    allowIpRestriction: user.allowIpRestriction,
  };
};

/**
 * Validate IP address format
 */
export const validateIpAddress = (ip: string): boolean => {
  // IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  // IPv6 validation (basic)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
  return ipv6Regex.test(ip);
};