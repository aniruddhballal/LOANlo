const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicantName: { type: String, required: true },
  
  // Personal Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'], required: true },
  aadhaarNumber: { type: String, required: true },
  panNumber: { type: String, required: true },
  
  // Contact Information
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  
  // Employment Information
  employmentType: { type: String, enum: ['salaried', 'self_employed', 'business', 'freelancer'], required: true },
  companyName: { type: String, required: true },
  designation: { type: String, required: true },
  workExperience: { type: Number, required: true },
  monthlyIncome: { type: Number, required: true },
  
  // Loan Information
  loanType: { type: String, enum: ['personal', 'home', 'vehicle', 'business', 'education'], required: true },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  tenure: { type: Number, required: true },
  
  // Application Status
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected'], 
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