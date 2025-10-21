import express from 'express';
import { authenticateToken } from '../middleware/auth';
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

const router = express.Router();

// Captcha routes
router.post('/captcha/verify', captchaRateLimiter, verifyCaptchaController);
router.get('/captcha/status', getCaptchaStatusController);

// Auth routes
router.post('/register', registerLimiter, registerController);
router.post('/login', authLimiter, loginController);
router.get('/verify-email', verifyEmailController);
router.post('/resend-verification', resendVerificationLimiter, resendVerificationController);
router.get('/verify', verifyLimiter, authenticateToken, checkIpWhitelist, verifyTokenController); // <-- ADDED checkIpWhitelist HERE

export default router;