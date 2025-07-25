const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/auth');
const { validateLoanApplication } = require('../middleware/validation');

router.post('/apply', authenticateToken, validateLoanApplication, loanController.submitApplication);
router.get('/my-applications', authenticateToken, loanController.getUserApplications);
router.get('/application/:applicationId', authenticateToken, loanController.getSingleApplication);

module.exports = router;