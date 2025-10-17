import { Router, Response } from 'express';
import upload from '../middleware/upload';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import LoanApplication from '../models/LoanApplication';
import Document, { DocumentType } from '../models/Document'; // import type if needed
import mongoose from 'mongoose';
import { Readable } from 'stream';
import User from '../models/User';

import {
  sendNewApplicationNotificationToUnderwriters,
  sendLoanStatusUpdateEmail
 } from '../utils/loanEmailService';

const router = Router();
// this route is used for both viewing and downloading the file - logic is slightly complex, but same api endpoint is used for both the functionalities - can switch to native/default downloading later if this seems too complex
router.get(
  '/file/:applicationId/:documentType',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId, documentType } = req.params as {
        applicationId: string;
        documentType: string;
      };

      // Find the document metadata
      const document = await Document.findOne({ applicationId, documentType });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }

      // Verify ownership for regular users
      if (
        req.user &&
        !['underwriter', 'system_admin', 'admin', 'reviewer'].includes(req.user.role)
      ) {
        const application = await LoanApplication.findOne({
          _id: applicationId,
          userId: req.user.userId,
        });
        if (!application) {
          return res.status(403).json({
            success: false,
            message: 'Access denied',
          });
        }
      }

      const conn = mongoose.connection;
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'documents' });

      // ✅ Verify file exists in GridFS BEFORE streaming
      const files = await bucket.find({ _id: document.gridFsId }).toArray();
      if (files.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found in storage',
        });
      }

      // Set headers BEFORE piping
      res.set({
        'Content-Type': document.fileType,
        'Content-Length': files[0]?.length?.toString() || '0', // ✅ Safe access
        'Content-Disposition': `inline; filename="${document.fileName}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      });

      // Stream file from GridFS
      const downloadStream = bucket.openDownloadStream(document.gridFsId);

      downloadStream.pipe(res);

      // ✅ Handle stream errors properly
      downloadStream.on('error', (err) => {
        console.error('GridFS download stream error:', err);
        // Can't send JSON response here, just end the response
        if (!res.headersSent) {
          res.status(500).end();
        } else {
          res.end();
        }
      });

    } catch (error: any) {
      console.error('Document download error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message,
        });
      }
    }
  }
);

router.delete(
  '/delete/:applicationId/:documentType',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId, documentType } = req.params as {
        applicationId: string;
        documentType: string;
      };

      // Find the document metadata
      const document = await Document.findOne({ applicationId, documentType });
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }

      // Verify user ownership
      const application = await LoanApplication.findOne({
        _id: applicationId,
        userId: req.user?.userId,
      });
      if (!application) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only delete your own documents',
        });
      }

      // Check if application allows modification
      if (['approved', 'disbursed'].includes(application.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete documents from approved or disbursed applications',
        });
      }

      // Delete file from GridFS
      const conn = mongoose.connection;
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'documents' });
      await bucket.delete(document.gridFsId).catch(() => {}); // ignore if already missing

      // Delete document record
      await Document.deleteOne({ _id: document._id });

      // Update application's document status if needed
      const remainingDocs = await Document.find({ applicationId });
      const requiredDocs = [
        'aadhaar',
        'pan',
        'salary_slips',
        'bank_statements',
        'employment_certificate',
        'photo',
      ];
      const uploadedRequiredDocs = remainingDocs.filter((doc) =>
        requiredDocs.includes(doc.documentType)
      ).length;

      if (uploadedRequiredDocs < requiredDocs.length && application.documentsUploaded) {
        application.documentsUploaded = false;

        if (application.status === 'under_review') {
          application.status = 'pending';
          application.statusHistory.push({
            status: 'pending',
            timestamp: new Date(),
            comment: `Document ${documentType} was deleted, additional documents required`,
          });
        }

        await application.save();
      }

      res.json({
        success: true,
        message: 'Document deleted successfully',
        deletedDocument: {
          documentType: document.documentType,
          fileName: document.fileName,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }
);

router.post(
  '/upload',
  authenticateToken,
  upload.single('document'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { documentType, applicationId } = req.body as {
        documentType: string;
        applicationId: string;
      };

      // Verify application belongs to user (or user has admin rights)
      let application;
      if (
        req.user &&
        ['underwriter', 'system_admin', 'admin'].includes(req.user.role)
      ) {
        application = await LoanApplication.findById(applicationId);
      } else {
        application = await LoanApplication.findOne({
          _id: applicationId,
          userId: req.user?.userId,
        });
      }

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      const conn = mongoose.connection;
      const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'documents' });

      // Delete existing document in GridFS if it exists
      const existingDoc = await Document.findOne({ applicationId, documentType });
      if (existingDoc) {
        await bucket.delete(existingDoc.gridFsId).catch(() => {});
        await Document.deleteMany({ applicationId, documentType });
      }

      // Create readable stream from buffer
      const readableStream = Readable.from(req.file.buffer);
      
      // Create upload stream to GridFS
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        metadata: {
          applicationId,
          documentType,
          userId: application.userId,
        },
      });

      let uploadError = false; // ✅ Add flag to track errors

      // Upload new file to GridFS
      readableStream.pipe(uploadStream)
        .on('error', (err) => {
          uploadError = true; // ✅ Set flag
          if (!res.headersSent) { // ✅ Check if response already sent
            return res.status(500).json({ message: 'Upload failed', error: err.message });
          }
        })
        .on('finish', async () => {
          if (uploadError) return; // ✅ Skip if error occurred
          
          try {
            // Save document metadata in MongoDB
            const document = new Document({
              applicationId,
              userId: application.userId,
              documentType,
              fileName: req.file!.originalname,
              fileSize: req.file!.size,
              fileType: req.file!.mimetype,
              gridFsId: uploadStream.id,
            });

            await document.save();

            // Check if all required documents are uploaded
            const requiredDocs: DocumentType[] = [
              'aadhaar',
              'pan',
              'salary_slips',
              'bank_statements',
              'employment_certificate',
              'photo',
            ];

            const allUploadedDocs = await Document.find({ applicationId });
            const uploadedTypes: DocumentType[] = allUploadedDocs.map(
              (doc) => doc.documentType
            );

            const allRequiredDocsUploaded = requiredDocs.every((doc) =>
              uploadedTypes.includes(doc)
            );

            // Update application status
            if (allRequiredDocsUploaded && !application.documentsUploaded) {
              application.documentsUploaded = true;
              application.status = 'under_review';
              application.statusHistory.push({
                status: 'under_review',
                timestamp: new Date(),
                comment: 'All required documents uploaded, application under review',
              });
              application.updatedAt = new Date();
              await application.save();
            }

            // --- SEND EMAILS HERE ---
            const applicant = await User.findById(application.userId); // or populate if needed

            if (!applicant) {
              console.warn(`Applicant not found for application ${application._id}`);
            } else {
              const applicantName = `${applicant.firstName} ${applicant.lastName}`;

            // 1. Notify underwriters
            await sendNewApplicationNotificationToUnderwriters(
              applicantName,
              application._id.toString(),
              application.loanType,
              application.amount
            );

            // 2. Notify applicant about status update
            await sendLoanStatusUpdateEmail(
              applicant.email,
              applicant.firstName,
              application._id.toString(),
              application.loanType,
              application.amount,
              'under_review',
              'All required documents uploaded, application is now under review'
            );
          }

            res.json({
              success: true,
              message: 'Document uploaded successfully',
              document: {
                id: document._id,
                documentType: document.documentType,
                fileName: document.fileName,
                uploadedAt: document.uploadedAt,
              },
              allRequiredDocsUploaded,
            });
          } catch (saveError: any) {
            if (!res.headersSent) { // ✅ Check before sending
              return res.status(500).json({ 
                message: 'Failed to save document metadata', 
                error: saveError.message 
              });
            }
          }
        });
    } catch (error: any) {
      if (!res.headersSent) { // ✅ Add check here too
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    }
  }
);

// Get uploaded documents for an application
router.get(
  '/:applicationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId } = req.params as { applicationId: string };

      // Verify application access
      let application;
      if (
        req.user &&
        ['underwriter', 'system_admin', 'admin'].includes(req.user.role)
      ) {
        application = await LoanApplication.findById(applicationId);
      } else {
        application = await LoanApplication.findOne({
          _id: applicationId,
          userId: req.user?.userId,
        });
      }

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      const documents = await Document.find({ applicationId });
      const uploadedDocuments = documents.map((doc) => doc.documentType);

      res.json({
        success: true,
        uploadedDocuments,
        documents: documents.map((doc) => ({
          id: doc._id,
          documentType: doc.documentType,
          fileName: doc.fileName,
          uploadedAt: doc.uploadedAt,
        })),
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Server error', error: error.message });
    }
  }
);

// Complete document submission
router.post(
  '/complete/:applicationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId } = req.params as { applicationId: string };

      // Verify application belongs to user
      const application = await LoanApplication.findOne({
        _id: applicationId,
        userId: req.user?.userId, // ✅ safe access
      });

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Check if all required documents are uploaded
      const requiredDocs: DocumentType[] = [
        'aadhaar',
        'pan',
        'salary_slips',
        'bank_statements',
        'employment_certificate',
        'photo',
      ];

      const uploadedDocs = await Document.find({ applicationId });
      const uploadedTypes: DocumentType[] = uploadedDocs.map(
        (doc) => doc.documentType
      );

      const missingDocs: DocumentType[] = requiredDocs.filter(
        (doc) => !uploadedTypes.includes(doc)
      );

      if (missingDocs.length > 0) {
        return res.status(400).json({
          message: 'Missing required documents',
          missingDocuments: missingDocs,
        });
      }

      // Update application status
      application.documentsUploaded = true;
      application.status = 'under_review';
      application.statusHistory.push({
        status: 'under_review',
        timestamp: new Date(),
        comment: 'All documents uploaded, application under review',
      });
      application.updatedAt = new Date();

      await application.save();

      res.json({
        success: true,
        message: 'Document submission completed successfully',
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;