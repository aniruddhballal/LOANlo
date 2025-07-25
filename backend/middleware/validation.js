const { sendErrorResponse } = require('../utils/responseHelper');
const { 
  LOAN_TYPES, 
  EMPLOYMENT_TYPES, 
  GENDER_OPTIONS, 
  MARITAL_STATUS_OPTIONS,
  DOCUMENT_TYPES 
} = require('../utils/constants');

const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return sendErrorResponse(res, 400, 'All required fields must be provided');
  }
  
  if (password.length < 6) {
    return sendErrorResponse(res, 400, 'Password must be at least 6 characters long');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return sendErrorResponse(res, 400, 'Please provide a valid email address');
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return sendErrorResponse(res, 400, 'Email and password are required');
  }
  
  next();
};

const validateLoanApplication = (req, res, next) => {
  const {
    firstName, lastName, dateOfBirth, gender, maritalStatus,
    aadhaarNumber, panNumber, email, phone, address, city, state, pincode,
    employmentType, companyName, designation, workExperience, monthlyIncome,
    loanType, amount, purpose, tenure
  } = req.body;
  
  // Check required fields
  const requiredFields = [
    'firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus',
    'aadhaarNumber', 'panNumber', 'email', 'phone', 'address', 'city', 
    'state', 'pincode', 'employmentType', 'companyName', 'designation',
    'workExperience', 'monthlyIncome', 'loanType', 'amount', 'purpose', 'tenure'
  ];
  
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return sendErrorResponse(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Validate enum values
  if (!GENDER_OPTIONS.includes(gender)) {
    return sendErrorResponse(res, 400, 'Invalid gender option');
  }
  
  if (!MARITAL_STATUS_OPTIONS.includes(maritalStatus)) {
    return sendErrorResponse(res, 400, 'Invalid marital status option');
  }
  
  if (!EMPLOYMENT_TYPES.includes(employmentType)) {
    return sendErrorResponse(res, 400, 'Invalid employment type');
  }
  
  if (!LOAN_TYPES.includes(loanType)) {
    return sendErrorResponse(res, 400, 'Invalid loan type');
  }
  
  // Validate numeric values
  if (isNaN(workExperience) || workExperience < 0) {
    return sendErrorResponse(res, 400, 'Work experience must be a valid positive number');
  }
  
  if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
    return sendErrorResponse(res, 400, 'Monthly income must be a valid positive number');
  }
  
  if (isNaN(amount) || amount <= 0) {
    return sendErrorResponse(res, 400, 'Loan amount must be a valid positive number');
  }
  
  if (isNaN(tenure) || tenure <= 0) {
    return sendErrorResponse(res, 400, 'Loan tenure must be a valid positive number');
  }
  
  // Validate Aadhaar number (12 digits)
  if (!/^\d{12}$/.test(aadhaarNumber)) {
    return sendErrorResponse(res, 400, 'Aadhaar number must be 12 digits');
  }
  
  // Validate PAN number (basic format)
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
    return sendErrorResponse(res, 400, 'Invalid PAN number format');
  }
  
  // Validate phone number (10 digits)
  if (!/^\d{10}$/.test(phone)) {
    return sendErrorResponse(res, 400, 'Phone number must be 10 digits');
  }
  
  // Validate pincode (6 digits)
  if (!/^\d{6}$/.test(pincode)) {
    return sendErrorResponse(res, 400, 'Pincode must be 6 digits');
  }
  
  next();
};

const validateDocumentUpload = (req, res, next) => {
  const { documentType, applicationId } = req.body;
  
  if (!documentType || !applicationId) {
    return sendErrorResponse(res, 400, 'Document type and application ID are required');
  }
  
  if (!DOCUMENT_TYPES.includes(documentType)) {
    return sendErrorResponse(res, 400, 'Invalid document type');
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateLoanApplication,
  validateDocumentUpload
};