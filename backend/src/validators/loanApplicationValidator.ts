import { Request, Response, NextFunction } from 'express';
import LoanType from '../models/LoanTypes';

export const validateLoanApplication = async (
  req: Request<{}, {}, { loanType: string; amount: number; purpose: string; tenure: number }> & { 
    user?: any; 
    validatedLoanType?: any 
  },
  res: Response,
  next: NextFunction
) => {
  try {
    const { loanType, amount, purpose, tenure } = req.body;

    // 1. Validate loan type exists and is active
    const loanTypeDoc = await LoanType.findById(loanType);
    
    if (!loanTypeDoc) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid loan type selected' 
      });
    }

    if (!loanTypeDoc.isActive) {
      return res.status(400).json({ 
        success: false,
        message: 'This loan type is currently not available' 
      });
    }

    // 2. Validate amount
    const loanAmount = parseFloat(amount.toString());
    
    if (isNaN(loanAmount) || loanAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid loan amount' 
      });
    }

    if (loanAmount < 10000) {
      return res.status(400).json({ 
        success: false,
        message: 'Minimum loan amount is ₹10,000' 
      });
    }

    if (loanAmount > loanTypeDoc.maxAmount) {
      return res.status(400).json({ 
        success: false,
        message: `Loan amount cannot exceed ₹${loanTypeDoc.maxAmount.toLocaleString('en-IN')} for ${loanTypeDoc.title}` 
      });
    }

    // 3. Validate tenure (assuming tenure is in months)
    const loanTenureMonths = parseFloat(tenure.toString());
    
    if (isNaN(loanTenureMonths) || loanTenureMonths <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid loan tenure' 
      });
    }

    const maxTenureMonths = loanTypeDoc.maxTenure * 12;
    
    if (loanTenureMonths < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Minimum loan tenure is 6 months' 
      });
    }

    if (loanTenureMonths > maxTenureMonths) {
      return res.status(400).json({ 
        success: false,
        message: `Loan tenure cannot exceed ${loanTypeDoc.maxTenure} year${loanTypeDoc.maxTenure > 1 ? 's' : ''} for ${loanTypeDoc.title}` 
      });
    }

    // 4. Validate purpose
    if (!purpose || typeof purpose !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Loan purpose is required' 
      });
    }

    const trimmedPurpose = purpose.trim();
    
    if (trimmedPurpose.length < 10) {
      return res.status(400).json({ 
        success: false,
        message: 'Loan purpose must be at least 10 characters long' 
      });
    }

    if (trimmedPurpose.length > 500) {
      return res.status(400).json({ 
        success: false,
        message: 'Loan purpose must not exceed 500 characters' 
      });
    }

    // Store validated loan type in request for use in the controller
    req.validatedLoanType = loanTypeDoc;
    
    next();
  } catch (error: any) {
    console.error('Validation error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error validating loan application',
      error: error.message 
    });
  }
};