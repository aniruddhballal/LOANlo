import { Router, Request, Response } from 'express';
import LoanType, { ILoanType } from '../models/LoanTypes';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/loan-types
 * @desc    Get all loan types (public or filtered based on query)
 * @access  Public (filtered) / Private (all data for underwriters)
 */
router.get(
  '/',
  async (req: Request, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      
      // If includeInactive, get all loan types (for underwriters/admin)
      const query = includeInactive ? {} : { isActive: true };
      
      const loanTypes = await LoanType.find(query).sort({ createdAt: -1 });
      
      res.json({
        success: true,
        loanTypes
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: 'Error fetching loan types', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   GET /api/loan-types/:id
 * @desc    Get single loan type by MongoDB _id
 * @access  Public
 */
router.get(
  '/:id',
  async (req: Request, res: Response) => {
    try {
      const loanType = await LoanType.findById(req.params.id);
      
      if (!loanType) {
        return res.status(404).json({ 
          success: false,
          message: 'Loan type not found' 
        });
      }
      
      res.json({
        success: true,
        loanType
      });
    } catch (error: any) {
      // Handle invalid MongoDB ObjectId
      if (error.name === 'CastError') {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid loan type ID format' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Error fetching loan type', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   GET /api/loan-types/type/:loanTypeId
 * @desc    Get loan type by loanTypeId (personal, home, etc.)
 * @access  Public
 */
router.get(
  '/type/:loanTypeId',
  async (req: Request, res: Response) => {
    try {
      const loanType = await LoanType.findOne({ 
        loanTypeId: req.params.loanTypeId,
        isActive: true 
      });
      
      if (!loanType) {
        return res.status(404).json({ 
          success: false,
          message: 'Loan type not found' 
        });
      }
      
      res.json({
        success: true,
        loanType
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        message: 'Error fetching loan type', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/loan-types
 * @desc    Create new loan type
 * @access  Private (Underwriter/Admin only)
 */
router.post(
  '/',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Authorization check
      if (req.user?.role !== 'underwriter' && req.user?.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Only underwriters can create loan types.' 
        });
      }

      const { 
        name,
        title, 
        catchyPhrase, 
        interestRateMin, 
        interestRateMax, 
        maxAmount, 
        maxTenure, 
        features, 
        isActive 
      } = req.body;

      // Validation - required fields
      if (!name || !title || !catchyPhrase) {
        return res.status(400).json({ 
          success: false,
          message: 'Missing required fields: name, title, catchyPhrase are required' 
        });
      }

      // Validate features array
      if (!features || !Array.isArray(features) || features.length !== 3) {
        return res.status(400).json({ 
          success: false,
          message: 'Features array must contain exactly 3 items' 
        });
      }

      // Validate features are non-empty strings
      if (features.some((f: string) => !f || f.trim().length === 0)) {
        return res.status(400).json({ 
          success: false,
          message: 'All features must be non-empty strings' 
        });
      }

      // Validate interest rates
      if (interestRateMin === undefined || interestRateMax === undefined) {
        return res.status(400).json({ 
          success: false,
          message: 'Both interestRateMin and interestRateMax are required' 
        });
      }

      if (interestRateMin < 0 || interestRateMax < 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Interest rates must be non-negative' 
        });
      }

      if (interestRateMin >= interestRateMax) {
        return res.status(400).json({ 
          success: false,
          message: 'interestRateMin must be less than interestRateMax' 
        });
      }

      // Validate maxAmount and maxTenure
      if (maxAmount === undefined || maxAmount <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'maxAmount must be a positive number' 
        });
      }

      if (maxTenure === undefined || maxTenure < 1) {
        return res.status(400).json({ 
          success: false,
          message: 'maxTenure must be at least 1 year' 
        });
      }

      // Create new loan type
      const loanType = new LoanType({
        name,
        title,
        catchyPhrase,
        interestRateMin,
        interestRateMax,
        maxAmount,
        maxTenure,
        features,
        isActive: isActive !== undefined ? isActive : true,
      });

      await loanType.save();
      
      res.status(201).json({
        success: true,
        message: 'Loan type created successfully',
        loanType
      });
    } catch (error: any) {
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error', 
          error: error.message 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Error creating loan type', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   PUT /api/loan-types/:id
 * @desc    Update loan type (partial update allowed)
 * @access  Private (Underwriter/Admin only)
 */
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Authorization check
      if (req.user?.role !== 'underwriter' && req.user?.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Only underwriters can update loan types.' 
        });
      }

      const { 
        name,
        title, 
        catchyPhrase, 
        interestRateMin, 
        interestRateMax, 
        maxAmount, 
        maxTenure, 
        features, 
        isActive 
      } = req.body;

      // Check if loan type exists
      const existingLoanType = await LoanType.findById(req.params.id);
      if (!existingLoanType) {
        return res.status(404).json({ 
          success: false,
          message: 'Loan type not found' 
        });
      }

      // Validate features if provided
      if (features !== undefined) {
        if (!Array.isArray(features) || features.length !== 3) {
          return res.status(400).json({ 
            success: false,
            message: 'Features array must contain exactly 3 items' 
          });
        }
        
        if (features.some((f: string) => !f || f.trim().length === 0)) {
          return res.status(400).json({ 
            success: false,
            message: 'All features must be non-empty strings' 
          });
        }
      }

      // Validate interest rates if both provided
      const newMinRate = interestRateMin !== undefined ? interestRateMin : existingLoanType.interestRateMin;
      const newMaxRate = interestRateMax !== undefined ? interestRateMax : existingLoanType.interestRateMax;

      if (newMinRate < 0 || newMaxRate < 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Interest rates must be non-negative' 
        });
      }

      if (newMinRate >= newMaxRate) {
        return res.status(400).json({ 
          success: false,
          message: 'interestRateMin must be less than interestRateMax' 
        });
      }

      // Validate maxAmount if provided
      if (maxAmount !== undefined && maxAmount <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'maxAmount must be a positive number' 
        });
      }

      // Validate maxTenure if provided
      if (maxTenure !== undefined && maxTenure < 1) {
        return res.status(400).json({ 
          success: false,
          message: 'maxTenure must be at least 1 year' 
        });
      }

      // Build update object
      const updateData: Partial<ILoanType> = {
        updatedAt: new Date(),
      };

      if (name !== undefined) updateData.name = name;
      if (title !== undefined) updateData.title = title;
      if (catchyPhrase !== undefined) updateData.catchyPhrase = catchyPhrase;
      if (interestRateMin !== undefined) updateData.interestRateMin = interestRateMin;
      if (interestRateMax !== undefined) updateData.interestRateMax = interestRateMax;
      if (maxAmount !== undefined) updateData.maxAmount = maxAmount;
      if (maxTenure !== undefined) updateData.maxTenure = maxTenure;
      if (features !== undefined) updateData.features = features;
      if (isActive !== undefined) updateData.isActive = isActive;

      // Update loan type
      const loanType = await LoanType.findByIdAndUpdate(
        req.params.id,
        updateData,
        { 
          new: true, // Return updated document
          runValidators: true // Run schema validators
        }
      );

      res.json({
        success: true,
        message: 'Loan type updated successfully',
        loanType
      });
    } catch (error: any) {
      // Handle invalid MongoDB ObjectId
      if (error.name === 'CastError') {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid loan type ID format' 
        });
      }
      
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          success: false,
          message: 'Validation error', 
          error: error.message 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Error updating loan type', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   PATCH /api/loan-types/:id/toggle
 * @desc    Toggle active status of loan type
 * @access  Private (Underwriter/Admin only)
 */
router.patch(
  '/:id/toggle',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Authorization check
      if (req.user?.role !== 'underwriter' && req.user?.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Only underwriters can toggle loan types.' 
        });
      }

      const loanType = await LoanType.findById(req.params.id);
      
      if (!loanType) {
        return res.status(404).json({ 
          success: false,
          message: 'Loan type not found' 
        });
      }
      
      loanType.isActive = !loanType.isActive;
      loanType.updatedAt = new Date();
      await loanType.save();
      
      res.json({
        success: true,
        message: `Loan type ${loanType.isActive ? 'activated' : 'deactivated'} successfully`,
        loanType
      });
    } catch (error: any) {
      if (error.name === 'CastError') {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid loan type ID format' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Error toggling loan type status', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   DELETE /api/loan-types/:id
 * @desc    Delete loan type (sets isActive to false)
 *          Use ?hard=true query param for permanent deletion
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Authorization check - only admin can delete
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Only admins can delete loan types.' 
        });
      }

      const hardDelete = req.query.hard === 'true';
      
      if (hardDelete) {
        // Hard delete - permanently remove from database
        const loanType = await LoanType.findByIdAndDelete(req.params.id);
        
        if (!loanType) {
          return res.status(404).json({ 
            success: false,
            message: 'Loan type not found' 
          });
        }
        
        res.json({ 
          success: true,
          message: 'Loan type permanently deleted',
          loanType 
        });
      } else {
        // Soft delete - set isActive to false
        const loanType = await LoanType.findByIdAndUpdate(
          req.params.id,
          { 
            isActive: false, 
            updatedAt: new Date() 
          },
          { new: true }
        );
        
        if (!loanType) {
          return res.status(404).json({ 
            success: false,
            message: 'Loan type not found' 
          });
        }
        
        res.json({ 
          success: true,
          message: 'Loan type deactivated successfully',
          loanType 
        });
      }
    } catch (error: any) {
      if (error.name === 'CastError') {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid loan type ID format' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Error deleting loan type', 
        error: error.message 
      });
    }
  }
);

/**
 * @route   POST /api/loan-types/bulk
 * @desc    Bulk create loan types (for initial setup)
 * @access  Private (Admin only)
 */
router.post(
  '/bulk',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Authorization check - only admin can bulk create
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. Only admins can bulk create loan types.' 
        });
      }

      const { loanTypes } = req.body;
      
      if (!Array.isArray(loanTypes) || loanTypes.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'loanTypes must be a non-empty array' 
        });
      }
      
      // Validate each loan type format
      for (const lt of loanTypes) {
        if (!lt.name || !lt.title) {
          return res.status(400).json({ 
            success: false,
            message: `Loan type must have name and title fields` 
          });
        }
        if (!lt.features || lt.features.length !== 3) {
          return res.status(400).json({ 
            success: false,
            message: `Loan type ${lt.loanTypeId} must have exactly 3 features` 
          });
        }
      }
      
      const createdLoanTypes = await LoanType.insertMany(loanTypes);
      
      res.status(201).json({
        success: true,
        message: `${createdLoanTypes.length} loan types created successfully`,
        loanTypes: createdLoanTypes
      });
    } catch (error: any) {
      if (error.message && error.message.includes('duplicate key')) {
        return res.status(409).json({ 
          success: false,
          message: 'One or more loan type IDs already exist' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Error bulk creating loan types', 
        error: error.message 
      });
    }
  }
);

export default router;