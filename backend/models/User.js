const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Original User fields
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['applicant', 'underwriter', 'system_admin'], default: 'applicant' },
  
  // PII fields (all optional since they're filled later)
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
  
  // Timestamps
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);