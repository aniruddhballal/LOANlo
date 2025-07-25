const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { updateUserDetailsAcrossCollections } = require('../utils/userSync');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHelper');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendErrorResponse(res, 400, 'User already exists with this email');
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
    const token = generateToken(user);

    sendSuccessResponse(res, 201, 'User registered successfully', {
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
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendErrorResponse(res, 400, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, 400, 'Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(user);

    sendSuccessResponse(res, 200, 'Login successful', {
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
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    sendSuccessResponse(res, 200, 'Token verified', {
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
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
      if (existingUser) {
        return sendErrorResponse(res, 400, 'Email already exists');
      }
    }
    
    const updateData = { firstName, lastName, email, phone };
    
    // Update user details across all collections using transaction
    await updateUserDetailsAcrossCollections(req.user.userId, updateData);
    
    // Get updated user data
    const user = await User.findById(req.user.userId).select('-password');

    sendSuccessResponse(res, 200, 'Profile updated successfully across all records', {
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
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  updateProfile
};