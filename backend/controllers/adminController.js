const User = require('../models/User');
const LoanApplication = require('../models/LoanApplication');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHelper');

const syncUserData = async (req, res) => {
  try {
    const users = await User.find({});
    let syncedCount = 0;

    for (const user of users) {
      await LoanApplication.updateMany(
        { userId: user._id },
        {
          $set: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            applicantName: `${user.firstName} ${user.lastName}`,
            updatedAt: new Date()
          }
        }
      );
      syncedCount++;
    }

    sendSuccessResponse(res, 200, `User data synchronized across all collections for ${syncedCount} users`);
  } catch (error) {
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

module.exports = {
  syncUserData
};