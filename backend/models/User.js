const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['applicant', 'underwriter', 'system_admin'], default: 'applicant' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);