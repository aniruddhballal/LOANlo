import { useState, useEffect } from 'react'
import { X, RefreshCw, Shield, AlertCircle, CheckCircle } from 'lucide-react'

interface CaptchaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onFail: () => void
  title?: string
  description?: string
}

const CaptchaModal: React.FC<CaptchaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFail,
  title = "Security Verification",
  description = "Please solve this simple math problem to continue"
}) => {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [operator, setOperator] = useState('+')
  const [userAnswer, setUserAnswer] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const maxAttempts = 3

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

  // Calculate correct answer
  const getCorrectAnswer = () => {
    switch (operator) {
      case '+':
        return num1 + num2
      case '-':
        return num1 - num2
      case '*':
        return num1 * num2
      default:
        return num1 + num2
    }
  }

  // Initialize captcha when modal opens
  useEffect(() => {
    if (isOpen) {
      generateCaptcha()
      setAttempts(0)
      setIsSuccess(false)
    }
  }, [isOpen])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userAnswer.trim()) {
      setError('Please enter an answer')
      return
    }

    setIsVerifying(true)
    setError('')

    // Simulate verification delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))

    const correctAnswer = getCorrectAnswer()
    const userNum = parseInt(userAnswer.trim())

    if (userNum === correctAnswer) {
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= maxAttempts) {
        setError(`Maximum attempts reached. Please try again later.`)
        setTimeout(() => {
          onFail()
          onClose()
        }, 2000)
      } else {
        setError(`Incorrect answer. ${maxAttempts - newAttempts} attempts remaining.`)
        generateCaptcha() // Generate new challenge
      }
    }
    
    setIsVerifying(false)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and negative sign
    if (value === '' || /^-?\d+$/.test(value)) {
      setUserAnswer(value)
      if (error) setError('')
    }
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

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Attempt {attempts + 1} of {maxAttempts}</p>
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 text-xs font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    disabled={isVerifying}
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
                disabled={isVerifying || isSuccess}
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                         text-center text-lg font-mono tracking-wider
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         placeholder:text-gray-400"
                placeholder="Enter your answer"
                autoComplete="off"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying || isSuccess || attempts >= maxAttempts}
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
              ) : (
                'Verify Answer'
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <span>SECURE</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>AUTOMATED</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>PROTECTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaptchaModal