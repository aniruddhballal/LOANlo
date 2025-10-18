import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStatusHistory {
  status: string;
  timestamp: Date;
  comment?: string;
  updatedBy?: string;
}

export interface IApprovalDetails {
  approvedAmount?: number;
  interestRate?: number;
  tenure?: number;
  emi?: number;
}

export interface ILoanApplication extends Document {
  userId: Types.ObjectId;

  loanType: 'personal' | 'home' | 'vehicle' | 'business' | 'education';
  amount: number;
  purpose: string;
  tenure: number;

  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'documents_requested';
  documentsUploaded: boolean;
  additionalDocumentsRequested: boolean;

  statusHistory: IStatusHistory[];

  rejectionReason?: string;
  approvalDetails?: IApprovalDetails;

  createdAt: Date;
  updatedAt: Date;

  isDeleted: boolean;
  deletedAt?: Date | undefined;

}

const loanApplicationSchema: Schema<ILoanApplication> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  loanType: {
    type: String,
    enum: ['personal', 'home', 'vehicle', 'business', 'education'],
    required: true
  },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  tenure: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'documents_requested'],
    default: 'pending'
  },
  documentsUploaded: { type: Boolean, default: false },
  additionalDocumentsRequested: { type: Boolean, default: false },

  statusHistory: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      comment: String,
      updatedBy: String
    }
  ],

  rejectionReason: String,
  approvalDetails: {
    approvedAmount: Number,
    interestRate: Number,
    tenure: Number,
    emi: Number
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: undefined }

});

// Automatically update `updatedAt` before save
loanApplicationSchema.pre<ILoanApplication>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Automatically exclude soft-deleted documents from queries (unless explicitly included)
loanApplicationSchema.pre(/^find/, function (next) {
  // @ts-ignore - Only apply filter if not explicitly querying for deleted items
  if (!this.getQuery().isDeleted) {
    // @ts-ignore
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const LoanApplication = mongoose.model<ILoanApplication>(
  'LoanApplication',
  loanApplicationSchema
);

export default LoanApplication;