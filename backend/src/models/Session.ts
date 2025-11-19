import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionToken: string;
  ipAddress: string;
  deviceInfo: {
    userAgent: string;
    browser?: string;
    os?: string;
    device?: string;
  };
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  isActive: boolean;
  loginTime: Date;
  lastActivity: Date;
  logoutTime?: Date;
  logoutReason?: 'user' | 'admin' | 'timeout' | 'security';
  loggedOutBy?: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema: Schema<ISession> = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  sessionToken: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  ipAddress: { type: String, required: true },
  deviceInfo: {
    userAgent: { type: String, required: true },
    browser: String,
    os: String,
    device: String
  },
  location: {
    country: String,
    city: String,
    region: String
  },
  isActive: { type: Boolean, default: true, index: true },
  loginTime: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  logoutTime: Date,
  logoutReason: { 
    type: String, 
    enum: ['user', 'admin', 'timeout', 'security'] 
  },
  loggedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, required: true, index: true }
}, {
  timestamps: true
});

// Compound indexes
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const Session = mongoose.model<ISession>('Session', sessionSchema);
export default Session;