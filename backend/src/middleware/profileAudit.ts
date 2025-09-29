import { Request } from 'express';
import User from '../models/User';
import ProfileHistory from '../models/ProfileHistory';

// Fields to track for changes
const TRACKED_FIELDS = [
  'firstName',
  'lastName',
  'dateOfBirth',
  'gender',
  'maritalStatus',
  'aadhaarNumber',
  'panNumber',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'pincode',
  'employmentType',
  'companyName',
  'designation',
  'workExperience',
  'monthlyIncome'
];

// Critical fields that should be stored in snapshot
const CRITICAL_FIELDS = ['aadhaarNumber', 'panNumber', 'monthlyIncome', 'employmentType'];

/**
 * Log profile changes to ProfileHistory collection
 * @param userId - User's MongoDB ObjectId
 * @param oldProfile - Original profile data
 * @param newProfile - Updated profile data
 * @param req - Express request object
 * @param changeType - Type of change (profile_update or profile_creation)
 */
export const logProfileChange = async (
  userId: string,
  oldProfile: any,
  newProfile: any,
  req: Request,
  changeType: 'profile_update' | 'profile_creation' = 'profile_update'
) => {
  try {
    const changedFields = new Map();

    // Compare each tracked field
    TRACKED_FIELDS.forEach(field => {
      const oldValue = oldProfile?.[field];
      const newValue = newProfile[field];

      // Check if value actually changed (handle undefined/null/empty string)
      if (oldValue !== newValue && !((!oldValue || oldValue === '') && (!newValue || newValue === ''))) {
        changedFields.set(field, {
          oldValue: oldValue || null,
          newValue: newValue || null
        });
      }
    });

    // Only log if there are actual changes (or it's a profile creation)
    if (changedFields.size > 0 || changeType === 'profile_creation') {
      // Create snapshot of critical fields
      const profileSnapshot: any = {};
      CRITICAL_FIELDS.forEach(field => {
        if (newProfile[field]) {
          profileSnapshot[field] = newProfile[field];
        }
      });

      await ProfileHistory.create({
        userId,
        changedFields: Object.fromEntries(changedFields),
        changeType,
        timestamp: new Date(),
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        profileSnapshot: Object.keys(profileSnapshot).length > 0 ? profileSnapshot : undefined
      });

      console.log(`Profile change logged for user ${userId}: ${changedFields.size} fields changed`);
    }
  } catch (error) {
    // Log error but don't block the main operation
    console.error('Failed to log profile change:', error);
  }
};

/**
 * Get profile change history for a user
 * @param userId - User's MongoDB ObjectId
 * @param limit - Number of records to return (default: 50)
 */
export const getProfileHistory = async (userId: string, limit: number = 50) => {
  return await ProfileHistory.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

/**
 * Get profile changes within a date range
 * @param userId - User's MongoDB ObjectId
 * @param startDate - Start date
 * @param endDate - End date
 */
export const getProfileHistoryByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  return await ProfileHistory.find({
    userId,
    timestamp: { $gte: startDate, $lte: endDate }
  })
    .sort({ timestamp: -1 })
    .lean();
};

/**
 * Check if specific field was changed recently
 * @param userId - User's MongoDB ObjectId
 * @param fieldName - Name of the field to check
 * @param withinDays - Number of days to look back (default: 30)
 */
export const wasFieldChangedRecently = async (
  userId: string,
  fieldName: string,
  withinDays: number = 30
): Promise<boolean> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - withinDays);

  const changes = await ProfileHistory.findOne({
    userId,
    timestamp: { $gte: cutoffDate },
    [`changedFields.${fieldName}`]: { $exists: true }
  });

  return changes !== null;
};