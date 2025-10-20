// Interface for captcha attempt tracking
export interface CaptchaAttempt {
  ip: string;
  sessionCount: number;
  totalAttempts: number;
  firstAttempt: Date;
  lastAttempt: Date;
}

// In-memory store for captcha rate limiting (use Redis in production)
const captchaAttempts = new Map<string, CaptchaAttempt>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  for (const [ip, attempt] of captchaAttempts.entries()) {
    if (attempt.firstAttempt < fiveMinutesAgo) {
      captchaAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get captcha attempt data for an IP
 */
export const getCaptchaAttempt = (ip: string): CaptchaAttempt | undefined => {
  return captchaAttempts.get(ip);
};

/**
 * Initialize or reset captcha attempt for an IP
 */
export const initializeCaptchaAttempt = (ip: string): CaptchaAttempt => {
  const now = new Date();
  const attempt: CaptchaAttempt = {
    ip,
    sessionCount: 0,
    totalAttempts: 0,
    firstAttempt: now,
    lastAttempt: now,
  };
  captchaAttempts.set(ip, attempt);
  return attempt;
};

/**
 * Update captcha attempts for an IP
 */
export const updateCaptchaAttempts = (
  ip: string,
  isNewSession: boolean = false,
  failed: boolean = false
): void => {
  let attempt = captchaAttempts.get(ip);
  if (attempt) {
    if (isNewSession) {
      attempt.sessionCount++;
    }
    if (failed) {
      attempt.totalAttempts++;
    }
    attempt.lastAttempt = new Date();
    captchaAttempts.set(ip, attempt);
  }
};

/**
 * Delete captcha attempt data for an IP
 */
export const deleteCaptchaAttempt = (ip: string): void => {
  captchaAttempts.delete(ip);
};

/**
 * Check if captcha attempt has expired (older than 5 minutes)
 */
export const isCaptchaAttemptExpired = (attempt: CaptchaAttempt): boolean => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return attempt.firstAttempt < fiveMinutesAgo;
};