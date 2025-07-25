const mongoose = require('mongoose');
const User = require('../models/User');
const LoanApplication = require('../models/LoanApplication');

// Helper function to update user details across all collections
const updateUserDetailsAcrossCollections = async (userId, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Update user collection
    await User.findByIdAndUpdate(userId, updateData, { session });
    
    // Prepare update object for loan applications
    const loanUpdateData = {};
    if (updateData.firstName) loanUpdateData.firstName = updateData.firstName;
    if (updateData.lastName) loanUpdateData.lastName = updateData.lastName;
    if (updateData.email) loanUpdateData.email = updateData.email;
    if (updateData.phone) loanUpdateData.phone = updateData.phone;
    
    // Update applicantName if first or last name changed
    if (updateData.firstName || updateData.lastName) {
      const user = await User.findById(userId).session(session);
      loanUpdateData.applicantName = `${user.firstName} ${user.lastName}`;
    }
    
    // Update all loan applications for this user
    if (Object.keys(loanUpdateData).length > 0) {
      await LoanApplication.updateMany(
        { userId: userId },
        { 
          $set: {
            ...loanUpdateData,
            updatedAt: new Date()
          }
        },
        { session }
      );
    }
    
    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = { updateUserDetailsAcrossCollections };