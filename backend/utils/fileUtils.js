const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const ensureUploadsDirectory = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created');
  }
};

// Create application-specific upload directory
const createApplicationDirectory = (applicationId) => {
  const appDir = path.join(__dirname, '..', 'uploads', applicationId);
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }
  return appDir;
};

// Delete file helper
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  ensureUploadsDirectory,
  createApplicationDirectory,
  deleteFile
};