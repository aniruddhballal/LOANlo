import { useState, useEffect } from 'react'
import { X, RefreshCw, Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import api from '../../api'

interface CaptchaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onFail: () => void
  title?: string
  description?: string
  apiBaseUrl?: string
}

interface RateLimitStatus {
  totalAttempts: number
  remainingAttempts: number
  sessionCount: number
  rateLimited: boolean
  timeRemaining: number
}

const CaptchaModal: React.FC<CaptchaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFail,
  title = "Security Verification",
  description = "Please solve this simple math problem to continue",
}) => {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [operator, setOperator] = useState('+')
  const [userAnswer, setUserAnswer] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isNewSession, setIsNewSession] = useState(true)

  const maxAttempts = 3
  const maxTotalAttempts = 9

  // Generate new captcha challenge
  const generateCaptcha = () => {
    const operators = ['+', '-', '*']
    const selectedOperator = operators[Math.floor(Math.random() * operators.length)]
    
    let n1, n2
    
    switch (selectedOperator) {
      case '+':
        n1 = Math.floor(Math.random() * 50) + 1
        n2 = Math.floor(Math.random() * 50) + 1
        break
      case '-':
        n1 = Math.floor(Math.random() * 50) + 25 // Ensure positive result
        n2 = Math.floor(Math.random() * n1) + 1
        break
      case '*':
        n1 = Math.floor(Math.random() * 9) + 1
        n2 = Math.floor(Math.random() * 9) + 1
        break
      default:
        n1 = Math.floor(Math.random() * 20) + 1
        n2 = Math.floor(Math.random() * 20) + 1
    }
    
    setNum1(n1)
    setNum2(n2)
    setOperator(selectedOperator)
    setUserAnswer('')
    setError('')
  }

  // Fetch rate limit status
  const fetchRateLimitStatus = async () => {
    try {
  const response = await api.get<RateLimitStatus>("/auth/captcha/status");
  const status = response.data;

  setRateLimitStatus(status);
  setIsRateLimited(status.rateLimited);
  setTimeRemaining(status.timeRemaining);

  if (status.rateLimited) {
    setError(
      `Rate limit exceeded. Please try again in ${Math.ceil(
        status.timeRemaining / 60
      )} minutes.`
    );
  }
} catch (err) {
  console.error("Failed to fetch rate limit status:", err);

  // Set default values on error
  setRateLimitStatus({
    totalAttempts: 0,
    remainingAttempts: 9,
    sessionCount: 0,
    rateLimited: false,
    timeRemaining: 0,
  });
}

  }

  // Timer for rate limit countdown
  useEffect(() => {
    if (isRateLimited && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRateLimited(false)
            setError('')
            fetchRateLimitStatus()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isRateLimited, timeRemaining])

  // Initialize captcha when modal opens
  useEffect(() => {
    if (isOpen) {
      generateCaptcha()
      setAttempts(0)
      setIsSuccess(false)
      setIsNewSession(true)
      fetchRateLimitStatus()
    }
  }, [isOpen])

  // Replace the handleSubmit function in your CaptchaModal.tsx with this fixed version:
  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault()
    
    if (isRateLimited) {
      return
    }

    if (!userAnswer.trim()) {
      setError('Please enter an answer')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const response = await api.post("/auth/captcha/verify", {
        answer: parseInt(userAnswer.trim()),
        num1,
        num2,
        operator,
        isNewSession,
      });

      const data = response.data;

      // Update rate limit status
      setRateLimitStatus((prev) =>
        prev
          ? {
              ...prev,
              remainingAttempts: data.remainingAttempts || 0,
              totalAttempts: 9 - (data.remainingAttempts || 0), // Calculate from remaining
            }
          : null
      );

      if (data.success) {
        // ✅ Correct answer
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        // This block should not execute since incorrect answers return 400 status
        // but keeping it as fallback
        handleIncorrectAnswer(data);
      }
    } catch (err: any) {
      console.error("Captcha verification error:", err);
      
      // Check if we have a response from the server
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data || {};
        
        if (status === 400) {
          // ❌ Wrong answer - this is the key fix!
          if (data.success === false && data.message === 'Incorrect answer') {
            handleIncorrectAnswer(data);
          } else {
            // Other 400 errors (validation, etc.)
            setError(data.message || 'Invalid request. Please try again.');
          }
        } else if (status === 429) {
          // Rate limit exceeded
          setIsRateLimited(true);
          setTimeRemaining(data.retryAfter || 300);
          setError(data.message || "Rate limit exceeded");

          setTimeout(() => {
            onFail();
            onClose();
          }, 2000);
        } else if (status >= 500) {
          // Server errors
          setError("Server error. Please try again later.");
        } else {
          // Other client errors
          setError(data.message || "An error occurred. Please try again.");
        }
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        // Network/connection errors
        setError("Unable to connect to server. Please check your connection and try again.");
      } else {
        // Unknown errors
        setError("An unexpected error occurred. Please try again.");
      }
    }
    
    setIsVerifying(false)
  }

  // Add this helper function to handle incorrect answers
  const handleIncorrectAnswer = (data: any) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setIsNewSession(false); // no longer new session after first attempt

    // Update rate limit status with the latest data
    setRateLimitStatus((prev) => 
      prev 
        ? {
            ...prev,
            remainingAttempts: data.remainingAttempts || 0,
            totalAttempts: 9 - (data.remainingAttempts || 0), // Calculate from remaining
          }
        : null
    );

    if (newAttempts >= maxAttempts) {
      setError("Maximum attempts reached for this session.");
      setTimeout(() => {
        onFail();
        onClose();
      }, 2000);
    } else {
      const remainingInSession = maxAttempts - newAttempts;
      const totalRemaining = data.remainingAttempts || 0;
      setError(
        `Incorrect answer. ${remainingInSession} attempts remaining in this session. ${totalRemaining} total attempts remaining.`
      );
      generateCaptcha(); // New challenge
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and negative sign
    if (value === '' || /^-?\d+$/.test(value)) {
      setUserAnswer(value)
      if (error) setError('')
    }
  }

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md transform animate-in zoom-in duration-300 delay-100">
        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-green-500/10 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 animate-in zoom-in duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-green-800 font-medium text-sm">Verification Successful!</p>
              </div>
            </div>
          </div>
        )}

        {/* Rate Limited Overlay */}
        {isRateLimited && (
          <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 animate-in zoom-in duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-red-800 font-medium text-sm mb-2">Rate Limited</p>
                <p className="text-red-600 text-xs">
                  Try again in: {formatTimeRemaining(timeRemaining)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                <span>Session: {attempts + 1} of {maxAttempts}</span>
                {rateLimitStatus && (
                  <>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <span>Total: {rateLimitStatus.totalAttempts}/{maxTotalAttempts}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isVerifying}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-6 text-center">
            {description}
          </p>

          {/* Rate limit warning */}
          {rateLimitStatus && rateLimitStatus.remainingAttempts <= 3 && !isRateLimited && (
            <div className="mb-4 p-3 rounded-xl border border-yellow-200 bg-yellow-50 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-yellow-700 text-xs font-medium">
                Warning: Only {rateLimitStatus.remainingAttempts} attempts remaining before rate limit.
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 text-xs font-medium">{error}</div>
            </div>
          )}

          <div className="space-y-6">
            {/* Math Problem Display */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-3 font-mono tracking-wider">
                  {num1} {operator} {num2} = ?
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <span>Math Challenge</span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    disabled={isVerifying || isRateLimited}
                    className="p-1 hover:bg-gray-200 rounded transition-colors duration-200 disabled:opacity-50"
                    title="Generate new challenge"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-2">
              <label htmlFor="captcha-answer" className="block text-sm font-medium text-gray-700">
                Your Answer
              </label>
              <input
                type="text"
                id="captcha-answer"
                value={userAnswer}
                onChange={handleInputChange}
                disabled={isVerifying || isSuccess || isRateLimited}
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                         text-center text-lg font-mono tracking-wider
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         placeholder:text-gray-400
                         text-gray-900"
                placeholder="Enter your answer"
                autoComplete="off"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isVerifying || isSuccess || attempts >= maxAttempts || isRateLimited}
              className="w-full flex items-center justify-center py-3 px-4
                       bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                       text-white font-medium text-sm rounded-xl
                       transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : isSuccess ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              ) : isRateLimited ? (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Rate Limited</span>
                </div>
              ) : (
                'Verify Answer'
              )}
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <span>SECURE</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>RATE LIMITED</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>PROTECTED</span>
            </div>
            {rateLimitStatus && !isRateLimited && (
              <div className="text-center mt-2 text-xs text-gray-400">
                {rateLimitStatus.remainingAttempts} of {maxTotalAttempts} total attempts remaining
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaptchaModal