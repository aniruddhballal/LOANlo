import { Request, Response, NextFunction } from 'express';
import {
  getCaptchaAttempt,
  initializeCaptchaAttempt,
  isCaptchaAttemptExpired,
} from '../utils/captchaStore';

/**
 * Middleware to rate limit captcha attempts
 * Limits to 9 total attempts per IP within a 5-minute window
 */
export const captchaRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  let attempt = getCaptchaAttempt(clientIP);

  // If no previous attempt or it's been more than 5 minutes, reset
  if (!attempt || isCaptchaAttemptExpired(attempt)) {
    attempt = initializeCaptchaAttempt(clientIP);
  }

  // Check if user has exceeded the limit (3 sessions * 3 attempts = 9 total attempts)
  if (attempt.totalAttempts >= 9) {
    const timeRemaining = Math.ceil(
      (attempt.firstAttempt.getTime() + 5 * 60 * 1000 - now.getTime()) / 1000
    );
    res.status(429).json({
      error: 'Captcha rate limit exceeded',
      message: `Too many captcha attempts. Please try again in ${Math.ceil(
        timeRemaining / 60
      )} minutes.`,
      retryAfter: timeRemaining,
      rateLimited: true,
    });
    return;
  }

  // Add current attempt info to request for use in routes
  (req as any).captchaAttempt = attempt;
  next();
};