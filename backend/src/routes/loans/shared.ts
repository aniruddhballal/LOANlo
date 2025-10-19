import { IDocument, DocumentType } from '../../models/Document';

// Type for document requirement objects
export interface DocumentRequirement {
  name: string;
  type: DocumentType;
  required: boolean;
  description: string;
  uploaded?: boolean;
  uploadedAt?: Date | undefined;
}

export const buildDocumentRequirements = (uploadedDocs: IDocument[]): DocumentRequirement[] => {
  // Use Partial<Record<...>> so TS knows keys may be missing
  const uploadedDocMap: Partial<Record<DocumentType, IDocument>> = {};

  uploadedDocs.forEach((doc) => {
    // Assert doc.documentType as DocumentType for safe indexing
    uploadedDocMap[doc.documentType as DocumentType] = doc;
  });

  const requirements: DocumentRequirement[] = [
    {
      name: 'Aadhaar Card',
      type: 'aadhaar',
      required: true,
      description: 'Government issued identity proof with 12-digit unique number',
    },
    {
      name: 'PAN Card',
      type: 'pan',
      required: true,
      description: 'Permanent Account Number card for tax identification',
    },
    {
      name: 'Salary Slips (Last 3 months)',
      type: 'salary_slips',
      required: true,
      description: 'Recent salary certificates showing current income',
    },
    {
      name: 'Bank Statements (Last 6 months)',
      type: 'bank_statements',
      required: true,
      description: 'Bank account statements for financial verification',
    },
    {
      name: 'Employment Certificate',
      type: 'employment_certificate',
      required: true,
      description: 'Letter from employer confirming current employment status',
    },
    {
      name: 'Photo',
      type: 'photo',
      required: true,
      description: 'Recent passport-size photograph for identification',
    },
    {
      name: 'Address Proof',
      type: 'address_proof',
      required: false,
      description: 'Utility bill or rent agreement showing current address',
    },
    {
      name: 'Income Tax Returns',
      type: 'itr',
      required: false,
      description: 'IT returns for additional income verification',
    },
  ];

  return requirements.map((req) => ({
    ...req,
    uploaded: !!uploadedDocMap[req.type],
    uploadedAt: uploadedDocMap[req.type]?.uploadedAt,
  }));
};