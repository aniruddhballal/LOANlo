// Application constants
const REQUIRED_DOCUMENTS = ['aadhaar', 'pan', 'salary_slips', 'bank_statements', 'employment_certificate', 'photo'];

const DOCUMENT_TYPES = [
  'aadhaar', 
  'pan', 
  'salary_slips', 
  'bank_statements', 
  'employment_certificate', 
  'photo', 
  'address_proof', 
  'itr'
];

const LOAN_TYPES = ['personal', 'home', 'vehicle', 'business', 'education'];

const EMPLOYMENT_TYPES = ['salaried', 'self_employed', 'business', 'freelancer'];

const APPLICATION_STATUSES = ['pending', 'under_review', 'approved', 'rejected'];

const USER_ROLES = ['borrower', 'loan_officer', 'admin'];

const GENDER_OPTIONS = ['male', 'female', 'other'];

const MARITAL_STATUS_OPTIONS = ['single', 'married', 'divorced', 'widowed'];

module.exports = {
  REQUIRED_DOCUMENTS,
  DOCUMENT_TYPES,
  LOAN_TYPES,
  EMPLOYMENT_TYPES,
  APPLICATION_STATUSES,
  USER_ROLES,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS
};