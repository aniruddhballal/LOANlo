import mongoose, { Schema, Document } from 'mongoose';

// Define TypeScript interface for User
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'applicant' | 'underwriter' | 'system_admin';
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  employmentType?: string;
  companyName?: string;
  designation?: string;
  workExperience?: string;
  monthlyIncome?: string;
  createdAt: Date;
  updatedAt: Date;  // ADD THIS
 
  // Email verification fields
  isEmailVerified: boolean;
  verificationToken?: string | undefined;
  verificationTokenExpiry?: Date | undefined;

  // Password reset fields
  resetPasswordToken?: string | undefined;
  resetPasswordTokenExpiry?: Date | undefined;
 
  // Profile completion
  isProfileComplete: boolean;
  calculateProfileCompletion(): number;
  
  // Soft delete fields
  isDeleted: boolean;
  deletedAt?: Date | undefined;
  
  // New fields
  ipWhitelist: {
    ip: string;
    description?: string;
    addedAt: Date;
    addedBy?: mongoose.Types.ObjectId;
  }[];
  allowIpRestriction: boolean;
}

const userSchema: Schema<IUser> = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ['applicant', 'underwriter', 'system_admin'],
    default: 'applicant'
  },
  dateOfBirth: String,
  gender: String,
  maritalStatus: String,
  aadhaarNumber: String,
  panNumber: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  employmentType: String,
  companyName: String,
  designation: String,
  workExperience: String,
  monthlyIncome: String,
  // REMOVE: createdAt: { type: Date, default: Date.now },
 
  // Email verification fields
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },

  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordTokenExpiry: { type: Date },
 
  // Profile completion
  isProfileComplete: { type: Boolean, default: false },
  
  // Soft delete fields
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  
  // New IP restriction fields
  ipWhitelist: [{
    ip: { type: String, required: true },
    description: String,
    addedAt: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  allowIpRestriction: { type: Boolean, default: false },
}, {
  timestamps: true  // ADD THIS - automatically creates createdAt and updatedAt
});

// Add method to calculate profile completion
userSchema.methods.calculateProfileCompletion = function (): number {
  let score = 0;
  if (this.firstName) score += 10;
  if (this.lastName) score += 10;
  if (this.email) score += 10;
  if (this.phone) score += 10;
  if (this.aadhaarNumber) score += 10;
  if (this.panNumber) score += 10;
  if (this.address) score += 10;
  if (this.city) score += 10;
  if (this.state) score += 10;
  if (this.pincode) score += 10;
  return score;
};

// UPDATED: Add query middleware to exclude soft-deleted users by default
// BUT allow bypassing when explicitly querying for deleted users
userSchema.pre(/^find/, function(next) {
  // Check if the query explicitly includes isDeleted
  // @ts-ignore - accessing mongoose query internals
  const query = this.getQuery();
  
  // If isDeleted is not explicitly set in the query, add the filter
  if (!('isDeleted' in query)) {
    // @ts-ignore
    this.find({ isDeleted: { $ne: true } });
  }
  // If isDeleted IS in the query, don't add the filter (let it through)
  
  next();
});

// Create and export model
const User = mongoose.model<IUser>('User', userSchema);
export default User;