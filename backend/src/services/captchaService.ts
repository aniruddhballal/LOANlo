import {
  getCaptchaAttempt,
  updateCaptchaAttempts,
  deleteCaptchaAttempt,
  isCaptchaAttemptExpired,
} from '../utils/captchaStore';

interface VerifyCaptchaParams {
  answer: number;
  num1: number;
  num2: number;
  operator: string;
  clientIP: string;
  isNewSession?: boolean;
}

interface VerifyCaptchaResult {
  success: boolean;
  message: string;
  remainingAttempts: number;
}

interface CaptchaStatusResult {
  totalAttempts: number;
  remainingAttempts: number;
  sessionCount: number;
  rateLimited: boolean;
  timeRemaining: number;
}

/**
 * Calculate the correct answer for a captcha
 */
const calculateCorrectAnswer = (num1: number, num2: number, operator: string): number | null => {
  switch (operator) {
    case '+':
      return num1 + num2;
    case '-':
      return num1 - num2;
    case '*':
      return num1 * num2;
    default:
      return null;
  }
};

/**
 * Verify a captcha answer
 */
export const verifyCaptcha = ({
  answer,
  num1,
  num2,
  operator,
  clientIP,
  isNewSession = false,
}: VerifyCaptchaParams): VerifyCaptchaResult => {
  // Calculate correct answer
  const correctAnswer = calculateCorrectAnswer(num1, num2, operator);

  if (correctAnswer === null) {
    return {
      success: false,
      message: 'Invalid operator',
      remainingAttempts: 0,
    };
  }

  const isCorrect = answer === correctAnswer;

  // Update attempt tracking
  updateCaptchaAttempts(clientIP, isNewSession, !isCorrect);

  const attempt = getCaptchaAttempt(clientIP);
  const remainingAttempts = 9 - (attempt?.totalAttempts || 0);

  if (isCorrect) {
    return {
      success: true,
      message: 'Captcha verified successfully',
      remainingAttempts,
    };
  } else {
    return {
      success: false,
      message: 'Incorrect answer',
      remainingAttempts: Math.max(0, remainingAttempts),
    };
  }
};

/**
 * Get captcha rate limit status for an IP
 */
export const getCaptchaStatus = (clientIP: string): CaptchaStatusResult => {
  const attempt = getCaptchaAttempt(clientIP);
  const now = new Date();

  if (!attempt) {
    return {
      totalAttempts: 0,
      remainingAttempts: 9,
      sessionCount: 0,
      rateLimited: false,
      timeRemaining: 0,
    };
  }

  const isExpired = isCaptchaAttemptExpired(attempt);

  if (isExpired) {
    deleteCaptchaAttempt(clientIP);
    return {
      totalAttempts: 0,
      remainingAttempts: 9,
      sessionCount: 0,
      rateLimited: false,
      timeRemaining: 0,
    };
  }

  const remainingAttempts = Math.max(0, 9 - attempt.totalAttempts);
  const rateLimited = attempt.totalAttempts >= 9;
  const timeRemaining = rateLimited
    ? Math.ceil((attempt.firstAttempt.getTime() + 5 * 60 * 1000 - now.getTime()) / 1000)
    : 0;

  return {
    totalAttempts: attempt.totalAttempts,
    remainingAttempts,
    sessionCount: attempt.sessionCount,
    rateLimited,
    timeRemaining: Math.max(0, timeRemaining),
  };
};