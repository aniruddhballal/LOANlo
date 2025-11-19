import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { checkIpWhitelist } from '../middleware/ipWhitelist';
import {
  authLimiter,
  registerLimiter,
  verifyLimiter,
  resendVerificationLimiter,
} from '../middleware/rateLimiters';
import { captchaRateLimiter } from '../middleware/captchaRateLimiter';
import {
  verifyCaptchaController,
  getCaptchaStatusController,
  registerController,
  loginController,
  verifyEmailController,
  resendVerificationController,
  verifyTokenController,
} from '../controllers/authController';

import { forgotPassword, resetPassword, verifyResetToken } from '../controllers/passwordResetController';

import {
  getUserSessions,
  getAllUserSessions,
  logoutSession,
  logoutAllUserSessions
} from '../controllers/sessionController';

const router = express.Router();

// Captcha routes
router.post('/captcha/verify', captchaRateLimiter, verifyCaptchaController);
router.get('/captcha/status', getCaptchaStatusController);

// Auth routes
router.post('/register', registerLimiter, registerController);
router.post('/login', authLimiter, loginController);
router.get('/verify-email', verifyEmailController);
router.post('/resend-verification', resendVerificationLimiter, resendVerificationController);
router.get('/verify', verifyLimiter, authenticateToken, checkIpWhitelist, verifyTokenController);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

// SESSION MANAGEMENT ROUTES
// User can view their own sessions
router.get('/sessions/:userId', authenticateToken, getUserSessions);

// User can logout their own session or specific session
router.delete('/sessions/:sessionId', authenticateToken, logoutSession);

// User can logout all their sessions
router.delete('/sessions/user/:userId/all', authenticateToken, logoutAllUserSessions);

// System admin routes for viewing all sessions
router.get('/admin/sessions', authenticateToken, requireRole('system_admin'), getAllUserSessions);

export default router;