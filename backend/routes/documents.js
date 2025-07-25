const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/auth');
const { validateDocumentUpload } = require('../middleware/validation');
const upload = require('../config/multer');

router.post('/upload', authenticateToken, validateDocumentUpload, upload.single('document'), documentController.uploadDocument);
router.get('/:applicationId', authenticateToken, documentController.getDocuments);
router.post('/complete/:applicationId', authenticateToken, documentController.completeDocumentSubmission);

module.exports = router;