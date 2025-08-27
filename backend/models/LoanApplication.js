const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 
  // Add this field to store the applicant name
  applicantName: { type: String, required: true },
  
  // Reference to KYC data (optional - for easy population)
  kycId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserKYC' },
 
  // Loan Information (only loan-specific fields)
  loanType: { type: String, enum: ['personal', 'home', 'vehicle', 'business', 'education'], required: true },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  tenure: { type: Number, required: true },
 
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'documents_requested'],
    default: 'pending'
  },
  documentsUploaded: { type: Boolean, default: false },
 
  // Status History
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    comment: String,
    updatedBy: String
  }],
 
  // Rejection/Approval Details
  rejectionReason: String,
  approvalDetails: {
    approvedAmount: Number,
    interestRate: Number,
    tenure: Number,
    emi: Number
  },
 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);