import mongoose, { Schema, Document } from 'mongoose';

export interface IRestorationRequest extends Document {
  applicationId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RestorationRequestSchema = new Schema<IRestorationRequest>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'LoanApplication',
      required: true
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
RestorationRequestSchema.index({ applicationId: 1, status: 1 });
RestorationRequestSchema.index({ requestedBy: 1 });
RestorationRequestSchema.index({ status: 1, createdAt: -1 });

// Prevent multiple pending requests for same application
RestorationRequestSchema.index(
  { applicationId: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'pending' }
  }
);

export default mongoose.model<IRestorationRequest>('RestorationRequest', RestorationRequestSchema);