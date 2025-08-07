import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface LoanData {
  loanType: string;
  amount: string;
  purpose: string;
  tenure: string;
}

interface KYCData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  aadhaarNumber: string;
  panNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  employmentType: string;
  companyName: string;
  designation: string;
  workExperience: string;
  monthlyIncome: string;
}

const LoanApplication = () => {
  const navigate = useNavigate()
  const [focusedField, setFocusedField] = useState<string>('')
  const [loanData, setLoanData] = useState<LoanData>({
    loanType: '',
    amount: '',
    purpose: '',
    tenure: ''
  })
  const [kycData, setKycData] = useState<KYCData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isKYCComplete, setIsKYCComplete] = useState(false)
  const [checkingKYC, setCheckingKYC] = useState(true)

  // Check KYC completion on mount
  useEffect(() => {
    const checkKYCCompletion = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5000/api/kyc/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        
        if (data.kyc) {
          // Check if all KYC fields are completed
          const requiredKYCFields = [
            'firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus',
            'aadhaarNumber', 'panNumber', 'email', 'phone', 'address', 'city',
            'state', 'pincode', 'employmentType', 'companyName', 'designation',
            'workExperience', 'monthlyIncome'
          ]
          
          const kycComplete = requiredKYCFields.every(field => {
            const value = data.kyc[field]
            return value !== null && value !== undefined && value.toString().trim() !== ''
          })
          
          if (kycComplete) {
            setKycData(data.kyc)
            setIsKYCComplete(true)
          } else {
            setIsKYCComplete(false)
          }
        } else {
          setIsKYCComplete(false)
        }
      } catch (err) {
        console.error('Error checking KYC:', err)
        setIsKYCComplete(false)
      } finally {
        setCheckingKYC(false)
      }
    }
    
    checkKYCCompletion()
  }, [])

  const isFormValid = (): boolean => {
    return Object.values(loanData).every(value => 
      value !== null && value !== undefined && value.toString().trim() !== ''
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setLoanData({
      ...loanData,
      [e.target.name]: e.target.value
    })
  }

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!isFormValid()) {
      setError('Please fill in all required fields before submitting.');
      return;
    }
    
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      // Combine KYC data with loan data for submission
      const applicationData = {
        ...kycData,
        ...loanData
      }
      
      const response = await fetch('http://localhost:5000/api/loans/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      })

      const data = await response.json()

      if (response.ok) {
        navigate(`/upload-documents/${data.applicationId}`)
      } else {
        setError(data.message || 'Application submission failed')
      }
    } catch (err) {
      setError('Application submission failed')
    } finally {
      setLoading(false)
    }
  }

  const renderSelectField = (
    name: keyof LoanData, 
    label: string, 
    options: { value: string; label: string }[], 
    required: boolean = true
  ) => (
    <div className="relative group">
      <label className={`block text-sm font-semibold text-gray-800 mb-2 tracking-wide ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}>
        {label}
      </label>
      <div className={`relative transition-all duration-300 ${focusedField === name ? 'transform scale-[1.02]' : ''}`}>
        <select
          name={name}
          value={loanData[name] || ''}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 pr-12 bg-white border-2 rounded-lg font-medium text-gray-800 transition-all duration-300 focus:outline-none hover:border-gray-400 cursor-pointer appearance-none ${
            focusedField === name 
              ? 'border-gray-800 shadow-lg transform scale-[1.01]' 
              : 'border-gray-200 shadow-sm'
          }`}
          required={required}
        >
          <option value="" className="text-gray-400">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-800">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )

  const renderTextareaField = (
    name: keyof LoanData, 
    label: string, 
    required: boolean = true
  ) => (
    <div className="relative group">
      <label className={`block text-sm font-semibold text-gray-800 mb-2 tracking-wide ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}>
        {label}
      </label>
      <div className={`relative transition-all duration-300 ${focusedField === name ? 'transform scale-[1.02]' : ''}`}>
        <textarea
          name={name}
          value={loanData[name] || ''}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          rows={4}
          className={`w-full px-4 py-3 bg-white border-2 rounded-lg font-medium text-gray-800 placeholder-gray-400 resize-none transition-all duration-300 focus:outline-none hover:border-gray-400 ${
            focusedField === name 
              ? 'border-gray-800 shadow-lg transform scale-[1.01]' 
              : 'border-gray-200 shadow-sm'
          }`}
          required={required}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </div>
  )

  const renderCurrencyField = (
    name: keyof LoanData, 
    label: string, 
    required: boolean = true,
    min?: string
  ) => (
    <div className="relative group">
      <label className={`block text-sm font-semibold text-gray-800 mb-2 tracking-wide ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}>
        {label}
      </label>
      <div className={`relative transition-all duration-300 ${focusedField === name ? 'transform scale-[1.02]' : ''}`}>
        <div className={`flex items-center bg-white border-2 rounded-lg transition-all duration-300 focus-within:outline-none hover:border-gray-400 ${
          focusedField === name 
            ? 'border-gray-800 shadow-lg transform scale-[1.01]' 
            : 'border-gray-200 shadow-sm'
        }`}>
          <span className="px-4 py-3 text-gray-600 font-semibold text-lg border-r border-gray-200">₹</span>
          <input
            type="number"
            name={name}
            value={loanData[name] || ''}
            onChange={handleChange}
            onFocus={() => handleFocus(name)}
            onBlur={handleBlur}
            className="flex-1 px-4 py-3 bg-transparent font-medium text-gray-800 placeholder-gray-400 focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            required={required}
            min={min}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  )

  // Loading state while checking KYC
  if (checkingKYC) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 animate-spin">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a8 8 0 110 15.292V15.25a5.75 5.75 0 000-11.5V4.354z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Your Status</h2>
          <p className="text-gray-600">Please wait while we verify your information...</p>
        </div>
      </div>
    )
  }

  // If KYC is not complete, show message to complete KYC first
  if (!isKYCComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto relative">
          {/* Header Section */}
          <div className="text-center mb-12 relative">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-600 to-red-500 rounded-full mb-6 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">KYC Required</h1>
            <p className="text-xl text-gray-600 font-medium tracking-wide">Complete your verification first</p>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-500 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Warning Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200 p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-transparent rounded-bl-3xl opacity-50"></div>
            
            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Your KYC First</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                To apply for a loan, you need to complete your Know Your Customer (KYC) verification process. 
                This helps us verify your identity and ensure compliance with financial regulations.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-red-800 mb-3">Required Information:</h3>
                <ul className="text-red-700 space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                    Personal Information (Name, DOB, Gender, etc.)
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                    Contact Information (Email, Phone, Address)
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                    Employment Information (Job, Income details)
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => navigate('/kyc')}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="tracking-wide">COMPLETE KYC</span>
                  <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="tracking-wide">GO BACK</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-green-500 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl font-bold text-white tracking-wider">LO</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">Loan Application</h1>
          <p className="text-xl text-gray-600 font-medium tracking-wide">Final step to get your loan approved</p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-green-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* KYC Status Card */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-8 flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-green-800">KYC Verified</h3>
            <p className="text-green-700">Your identity has been successfully verified. You can now proceed with your loan application.</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 lg:p-12 relative overflow-hidden">
          {/* Subtle corner accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent rounded-bl-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-100 to-transparent rounded-tr-3xl opacity-50"></div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50/20 border-2 border-red-400 rounded-lg animate-shake">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="space-y-8">
              <div className="text-center border-b pb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">Loan Information</h3>
                <p className="text-gray-600 font-medium">Specify your loan requirements and intended purpose</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderSelectField('loanType', 'Loan Type', [
                  { value: 'personal', label: 'Personal Loan' },
                  { value: 'home', label: 'Home Loan' },
                  { value: 'vehicle', label: 'Vehicle Loan' },
                  { value: 'business', label: 'Business Loan' },
                  { value: 'education', label: 'Education Loan' }
                ])}
                
                {renderCurrencyField('amount', 'Loan Amount Required', true, '1000')}
                
                {renderSelectField('tenure', 'Repayment Tenure', [
                  { value: '6', label: '6 Months' },
                  { value: '12', label: '12 Months' },
                  { value: '24', label: '24 Months' },
                  { value: '36', label: '36 Months' },
                  { value: '48', label: '48 Months' },
                  { value: '60', label: '60 Months' },
                  { value: '84', label: '84 Months' },
                  { value: '120', label: '120 Months' }
                ])}
                
                <div className="lg:col-span-2">
                  {renderTextareaField('purpose', 'Purpose of Loan')}
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Application Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Applicant:</span>
                  <span className="ml-2 text-gray-600">{kycData?.firstName} {kycData?.lastName}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{kycData?.email}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Monthly Income:</span>
                  <span className="ml-2 text-gray-600">₹{kycData?.monthlyIncome}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Employment:</span>
                  <span className="ml-2 text-gray-600">{kycData?.employmentType}</span>
                </div>
                {loanData.loanType && (
                  <div>
                    <span className="font-semibold text-gray-700">Loan Type:</span>
                    <span className="ml-2 text-gray-600 capitalize">{loanData.loanType} Loan</span>
                  </div>
                )}
                {loanData.amount && (
                  <div>
                    <span className="font-semibold text-gray-700">Loan Amount:</span>
                    <span className="ml-2 text-gray-600">₹{loanData.amount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={loading || !isFormValid()}
                className={`inline-flex items-center px-12 py-4 rounded-xl font-bold tracking-wide focus:outline-none focus:ring-4 transition-all duration-200 transform shadow-xl relative overflow-hidden ${
                loading || !isFormValid()
                  ? 'bg-gray-50/30 border-2 border-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-50 border-2 border-green-700 text-green-800 hover:bg-green-100 hover:border-green-800 hover:scale-105 focus:ring-4 focus:ring-green-200'
                }`}
              >
                {loading && (
                  <div className="absolute inset-0 bg-yellow-400/30 animate-pulse"></div>
                )}
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>SUBMITTING APPLICATION...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT LOAN APPLICATION</span>
                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isFormValid() && (
                      <div className="absolute inset-0 bg-white/10 animate-ping rounded-xl"></div>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm font-medium tracking-wide">© 2024 LOANlo Financial Services. All rights reserved.</p>
          <p className="text-xs mt-2">Secure • Professional • Confidential</p>
        </div>
      </div>
    </div>
  )
}

export default LoanApplication