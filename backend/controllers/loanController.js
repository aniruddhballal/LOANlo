const LoanApplication = require('../models/LoanApplication');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHelper');

const submitApplication = async (req, res) => {
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

    sendSuccessResponse(res, 201, 'Loan application submitted successfully', {
      applicationId: loanApplication._id
    });
  } catch (error) {
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

const getUserApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({ userId: req.user.userId })
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    sendSuccessResponse(res, 200, 'Applications retrieved successfully', {
      applications
    });
  } catch (error) {
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

const getSingleApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await LoanApplication.findOne({ 
      _id: applicationId, 
      userId: req.user.userId 
    }).populate('userId', 'firstName lastName email phone');
    
    if (!application) {
      return sendErrorResponse(res, 404, 'Application not found');
    }

    sendSuccessResponse(res, 200, 'Application retrieved successfully', {
      application
    });
  } catch (error) {
    sendErrorResponse(res, 500, 'Server error', error.message);
  }
};

module.exports = {
  submitApplication,
  getUserApplications,
  getSingleApplication
};