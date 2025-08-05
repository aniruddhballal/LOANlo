const mongoose = require('mongoose');
const User = require('../models/User');
const LoanApplication = require('../models/LoanApplication');

// Helper function to update user details across all collections
const updateUserDetailsAcrossCollections = async (userId, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
 
  try {
    // Update user collection (including password if provided)
    await User.findByIdAndUpdate(userId, updateData, { session });
   
    // Prepare update object for loan applications (exclude password)
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
   
    // Update all loan applications for this user (don't include password)
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

// Helper function to delete user data across all collections
const deleteUserDataAcrossCollections = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(`Starting cascaded deletion for user: ${userId}`);

    // Delete all loan applications for this user
    const loanDeletionResult = await LoanApplication.deleteMany(
      { userId: userId },
      { session }
    );
    console.log(`Deleted ${loanDeletionResult.deletedCount} loan applications`);

    // Add more collections here as your app grows
    // Example for future collections:
    // const paymentDeletionResult = await Payment.deleteMany({ userId: userId }, { session });
    // const documentDeletionResult = await Document.deleteMany({ userId: userId }, { session });
    // const notificationDeletionResult = await Notification.deleteMany({ userId: userId }, { session });

    // Delete the user record last
    const userDeletionResult = await User.findByIdAndDelete(userId, { session });
    if (!userDeletionResult) {
      throw new Error('User not found during deletion');
    }
    console.log(`Deleted user record: ${userId}`);

    await session.commitTransaction();
    console.log(`Cascaded deletion completed successfully for user: ${userId}`);
    return {
      success: true,
      deletedLoanApplications: loanDeletionResult.deletedCount,
      deletedUser: true
    };

  } catch (error) {
    await session.abortTransaction();
    console.error('Error during cascaded deletion:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = { 
  updateUserDetailsAcrossCollections,
  deleteUserDataAcrossCollections 
};