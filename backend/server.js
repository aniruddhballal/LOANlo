const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

const PORT = process.env.PORT;


// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['borrower', 'loan_officer', 'admin'], default: 'borrower' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Loan Application Schema
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

const LoanApplication = mongoose.model('LoanApplication', loanApplicationSchema);

// Document Schema
const documentSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documentType: { 
    type: String, 
    enum: ['aadhaar', 'pan', 'salary_slips', 'bank_statements', 'employment_certificate', 'photo', 'address_proof', 'itr'],
    required: true 
  },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', documentSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = `uploads/${req.body.applicationId}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.body.documentType}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

// AUTH ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, email, phone },
      { new: true, select: '-password' }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// LOAN APPLICATION ROUTES

// Submit loan application
app.post('/api/loans/apply', authenticateToken, async (req, res) => {
  try {
    const loanData = req.body;
    
    const loanApplication = new LoanApplication({
      ...loanData,
      userId: req.user.userId,
      applicantName: `${loanData.firstName} ${loanData.lastName}`,
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        comment: 'Application submitted'
      }]
    });

    await loanApplication.save();

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      applicationId: loanApplication._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's loan applications
app.get('/api/loans/my-applications', authenticateToken, async (req, res) => {
  try {
    const applications = await LoanApplication.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DOCUMENT ROUTES

// Upload document
app.post('/api/documents/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType, applicationId } = req.body;

    // Verify application belongs to user
    const application = await LoanApplication.findOne({ 
      _id: applicationId, 
      userId: req.user.userId 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Remove existing document of same type for this application
    await Document.deleteMany({ applicationId, documentType });

    // Save document record
    const document = new Document({
      applicationId,
      userId: req.user.userId,
      documentType,
      fileName: req.file.originalname,
      filePath: req.file.path
    });

    await document.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        documentType: document.documentType,
        fileName: document.fileName,
        uploadedAt: document.uploadedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get uploaded documents for an application
app.get('/api/documents/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify application belongs to user
    const application = await LoanApplication.findOne({ 
      _id: applicationId, 
      userId: req.user.userId 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const documents = await Document.find({ applicationId });
    const uploadedDocuments = documents.map(doc => doc.documentType);

    res.json({
      success: true,
      uploadedDocuments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete document submission
app.post('/api/documents/complete/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Verify application belongs to user
    const application = await LoanApplication.findOne({ 
      _id: applicationId, 
      userId: req.user.userId 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if all required documents are uploaded
    const requiredDocs = ['aadhaar', 'pan', 'salary_slips', 'bank_statements', 'employment_certificate', 'photo'];
    const uploadedDocs = await Document.find({ applicationId });
    const uploadedTypes = uploadedDocs.map(doc => doc.documentType);
    
    const missingDocs = requiredDocs.filter(doc => !uploadedTypes.includes(doc));
    
    if (missingDocs.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required documents', 
        missingDocuments: missingDocs 
      });
    }

    // Update application status
    application.documentsUploaded = true;
    application.status = 'under_review';
    application.statusHistory.push({
      status: 'under_review',
      timestamp: new Date(),
      comment: 'All documents uploaded, application under review'
    });
    application.updatedAt = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Document submission completed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});
