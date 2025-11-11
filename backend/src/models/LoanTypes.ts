import mongoose, { Schema, Document } from 'mongoose';

export interface ILoanType extends Document {
  name: string; // 'Personal Loan', 'Home Loan', 'Business Loan', etc.
  title: string; // 'Get instant personal loans', 'Finance your dream home', etc.
  catchyPhrase: string; // 'Quick funds for any personal need'
  interestRateMin: number; // 10.5
  interestRateMax: number; // 18
  maxAmount: number; // 2500000 (₹25 Lakhs)
  maxTenure: number; // 5 (years)
  features: string[]; // Array of 3 bullet points
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const loanTypeSchema: Schema<ILoanType> = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  catchyPhrase: {
    type: String,
    required: true
  },
  interestRateMin: {
    type: Number,
    required: true,
    min: 0
  },
  interestRateMax: {
    type: Number,
    required: true,
    min: 0
  },
  maxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  maxTenure: {
    type: Number,
    required: true,
    min: 1
  },
  features: {
    type: [String],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return v.length === 3;
      },
      message: 'Features array must contain exactly 3 items'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
  // REMOVE createdAt and updatedAt fields
}, {
  timestamps: true  // ADD THIS
});

// REMOVE this pre-save hook:
// loanTypeSchema.pre<ILoanType>('save', function (next) {
//   this.updatedAt = new Date();
//   next();
// });

// // Only return active loan types by default
// loanTypeSchema.pre(/^find/, function (next) {
//   // @ts-ignore
//   if (!this.getQuery().isActive) {
//     // @ts-ignore
//     this.where({ isActive: { $ne: false } });
//   }
//   next();
// });

const LoanType = mongoose.model<ILoanType>('LoanType', loanTypeSchema);

export default LoanType;