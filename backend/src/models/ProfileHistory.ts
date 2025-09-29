import mongoose, { Schema, Document } from 'mongoose';

// TypeScript interface for ProfileHistory
export interface IProfileHistory extends Document {
  userId: mongoose.Types.ObjectId;
  changedFields: Map<string, {
    oldValue: any;
    newValue: any;
  }>;
  changeType: 'profile_update' | 'profile_creation';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  // Optional: Store complete profile snapshot for critical fields
  profileSnapshot?: {
    aadhaarNumber?: string;
    panNumber?: string;
    monthlyIncome?: string;
    employmentType?: string;
  };
}

// Schema definition
const profileHistorySchema: Schema<IProfileHistory> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for fast queries by user
  },
  changedFields: {
    type: Map,
    of: new Schema({
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed
    }, { _id: false }),
    required: true
  },
  changeType: {
    type: String,
    enum: ['profile_update', 'profile_creation'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Index for time-based queries
  },
  ipAddress: String,
  userAgent: String,
  profileSnapshot: {
    aadhaarNumber: String,
    panNumber: String,
    monthlyIncome: String,
    employmentType: String
  }
});

// Compound index for efficient querying
profileHistorySchema.index({ userId: 1, timestamp: -1 });

// Create and export model
const ProfileHistory = mongoose.model<IProfileHistory>('ProfileHistory', profileHistorySchema);
export default ProfileHistory;