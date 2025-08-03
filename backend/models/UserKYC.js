const mongoose = require('mongoose');

const userKYCschema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: String,
  lastName: String,
  dateOfBirth: String,
  gender: String,
  maritalStatus: String,
  aadhaarNumber: String,
  panNumber: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  employmentType: String,
  companyName: String,
  designation: String,
  workExperience: String,
  monthlyIncome: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserKYC', userKYCschema);