import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

// Exported type for documentType
export type DocumentType =
  | 'aadhaar'
  | 'pan'
  | 'salary_slips'
  | 'bank_statements'
  | 'employment_certificate'
  | 'photo'
  | 'address_proof'
  | 'itr';

// Define the interface for the Document
export interface IDocument extends MongooseDocument {
  applicationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  documentType: DocumentType; // use the exported type
  fileName: string;
  fileSize: number;
  fileType: string; // MIME type (e.g. image/png, application/pdf)
  gridFsId: mongoose.Types.ObjectId; // Reference to file in GridFS
  uploadedAt: Date;
}

const documentSchema = new Schema<IDocument>({
  applicationId: { type: Schema.Types.ObjectId, ref: 'LoanApplication', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: {
    type: String,
    enum: [
      'aadhaar',
      'pan',
      'salary_slips',
      'bank_statements',
      'employment_certificate',
      'photo',
      'address_proof',
      'itr',
    ],
    required: true,
  },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  gridFsId: { type: Schema.Types.ObjectId, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDocument>('Document', documentSchema);