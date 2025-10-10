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
  
  // Email verification fields
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  
  // Profile completion
  isProfileComplete: boolean;
  calculateProfileCompletion(): number;
}

// Schema definition
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
  createdAt: { type: Date, default: Date.now },
  
  // Email verification fields
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
  
  // Profile completion
  isProfileComplete: { type: Boolean, default: false },
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

// Create and export model
const User = mongoose.model<IUser>('User', userSchema);
export default User;