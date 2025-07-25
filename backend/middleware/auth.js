const jwt = require('jsonwebtoken');
const { sendErrorResponse } = require('../utils/responseHelper');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendErrorResponse(res, 401, 'Access token required');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return sendErrorResponse(res, 403, 'Invalid or expired token');
    }
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendErrorResponse(res, 403, 'Insufficient permissions');
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };