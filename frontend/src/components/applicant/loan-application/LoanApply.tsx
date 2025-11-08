import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../../api'
import { LoadingState, ErrorMessage, SuccessMessage } from '../../ui/StatusMessages'
import { PersonalDetailsRequired } from './PersonalDetailsRequired'
import { LoanForm } from './LoanForm'
import { ApplicationSummary } from './ApplicationSummary'

interface LoanType {
  _id: string
  name: string
  title: string
  catchyPhrase: string
  features: string[]
  interestRateMin: number
  interestRateMax: number
  maxAmount: number
  maxTenure: number
  isActive: boolean
}

interface LoanData {
  loanType: string
  amount: string
  purpose: string
  tenure: string
}

interface PersonalDetailsData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  maritalStatus: string
  aadhaarNumber: string
  panNumber: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  employmentType: string
  companyName: string
  designation: string
  workExperience: string
  monthlyIncome: string
}

interface ValidationErrors {
  amount?: string
  tenure?: string
  purpose?: string
}

const LoanApply = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [focusedField, setFocusedField] = useState<string>('')
  const [loanData, setLoanData] = useState<LoanData>({
    loanType: '',
    amount: '',
    purpose: '',
    tenure: ''
  })
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null)
  const [personalDetails, setPersonalDetails] = useState<PersonalDetailsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isPersonalDetailsComplete, setIsPersonalDetailsComplete] = useState(false)
  const [checkingPersonalDetails, setCheckingPersonalDetails] = useState(true)
  const [loadingLoanType, setLoadingLoanType] = useState(false)

  const cameFromPersonalDetails = location.state?.fromPersonalDetails === true

  // Get selected loan type ID from navigation state and fetch full details
  useEffect(() => {
    const loanTypeId = location.state?.selectedLoanType
    
    if (loanTypeId) {
      setLoanData(prev => ({
        ...prev,
        loanType: loanTypeId
      }))
      
      // Fetch full loan type details
      const fetchLoanTypeDetails = async () => {
        try {
          setLoadingLoanType(true)
          const response = await api.get(`/loan-types/${loanTypeId}`)
          const loanTypeData = response.data.loanType || response.data
          setSelectedLoanType(loanTypeData)
        } catch (err) {
          console.error('Error fetching loan type details:', err)
          setError('Failed to load loan type details')
        } finally {
          setLoadingLoanType(false)
        }
      }
      
      fetchLoanTypeDetails()
    }
  }, [location.state])

  // Check Personal Details completion on mount
  useEffect(() => {
    const checkPersonalDetailsCompletion = async () => {
      try {
        const { data } = await api.get('/profile/me')

        if (data.user) {
          const requiredFields = [
            'firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus',
            'aadhaarNumber', 'panNumber', 'email', 'phone', 'address', 'city',
            'state', 'pincode', 'employmentType', 'companyName', 'designation',
            'workExperience', 'monthlyIncome'
          ]

          const complete = requiredFields.every(field => {
            const value = data.user[field]
            return value !== null && value !== undefined && value.toString().trim() !== ''
          })

          if (complete) {
            setPersonalDetails(data.user)
            setIsPersonalDetailsComplete(true)
          } else {
            setIsPersonalDetailsComplete(false)
          }
        } else {
          setIsPersonalDetailsComplete(false)
        }
      } catch (err: any) {
        console.error('Error checking Personal Details:', err.response?.data?.message || err)
        setIsPersonalDetailsComplete(false)
      } finally {
        setCheckingPersonalDetails(false)
      }
    }

    checkPersonalDetailsCompletion()
  }, [])

  // Validate individual field
  const validateField = (name: string, value: string): string | undefined => {
    if (!selectedLoanType) return undefined

    switch (name) {
      case 'amount':
        const amount = parseFloat(value)
        if (isNaN(amount) || amount <= 0) {
          return 'Please enter a valid loan amount'
        }
        if (amount > selectedLoanType.maxAmount) {
          return `Maximum loan amount is ₹${selectedLoanType.maxAmount.toLocaleString('en-IN')}`
        }
        if (amount < 10000) {
          return 'Minimum loan amount is ₹10,000'
        }
        break

      case 'tenure':
        const tenure = parseFloat(value)
        if (isNaN(tenure) || tenure <= 0) {
          return 'Please enter a valid tenure'
        }
        if (tenure > selectedLoanType.maxTenure) {
          return `Maximum tenure is ${selectedLoanType.maxTenure} year${selectedLoanType.maxTenure > 1 ? 's' : ''}`
        }
        if (tenure < 1) {
          return 'Minimum tenure is 1 year'
        }
        break

      case 'purpose':
        if (!value || value.trim().length < 10) {
          return 'Purpose must be at least 10 characters'
        }
        if (value.trim().length > 500) {
          return 'Purpose must not exceed 500 characters'
        }
        break
    }

    return undefined
  }

  // Validate all fields
  const validateAllFields = (): boolean => {
    const errors: ValidationErrors = {}
    
    const amountError = validateField('amount', loanData.amount)
    const tenureError = validateField('tenure', loanData.tenure)
    const purposeError = validateField('purpose', loanData.purpose)

    if (amountError) errors.amount = amountError
    if (tenureError) errors.tenure = tenureError
    if (purposeError) errors.purpose = purposeError

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isFormValid = (): boolean => {
    // Check if all fields are filled
    const allFieldsFilled = Object.values(loanData).every(value => 
      value !== null && value !== undefined && value.toString().trim() !== ''
    )
    
    // Check if there are no validation errors
    const noValidationErrors = Object.keys(validationErrors).length === 0
    
    // Check if fields meet minimum requirements (even if not blurred yet)
    if (!selectedLoanType) return false
    
    const amount = parseFloat(loanData.amount)
    const tenure = parseFloat(loanData.tenure)
    const purpose = loanData.purpose.trim()
    
    const meetsRequirements = 
      !isNaN(amount) && 
      amount >= 10000 && 
      amount <= selectedLoanType.maxAmount &&
      !isNaN(tenure) && 
      tenure >= 6 && 
      tenure <= (selectedLoanType.maxTenure * 12) &&
      purpose.length >= 10 &&
      purpose.length <= 500
    
    return allFieldsFilled && noValidationErrors && meetsRequirements
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setLoanData({
      ...loanData,
      [name]: value
    })

    // Clear validation error for this field
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof ValidationErrors]
        return newErrors
      })
    }
  }

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFocusedField('')
    
    // Validate field on blur
    const { name, value } = e.target
    const error = validateField(name, value)
    
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate all fields
    if (!validateAllFields()) {
      setError('Please fix all validation errors before submitting')
      return
    }
    
    if (!isFormValid()) {
      setError('Please fill in all required fields before submitting')
      return
    }
    
    if (!selectedLoanType) {
      setError('Selected loan type is invalid')
      return
    }
    
    setError('')
    setLoading(true)

    try {
      const applicationData = {
        ...personalDetails,
        ...loanData,
        loanType: selectedLoanType._id,
      }
      const { data } = await api.post('/loans/apply', applicationData)
      navigate("/upload-documents", { state: { applicationId: data.applicationId } })
    } catch (err: any) {
      setError(err.response?.data?.message || "Application submission failed")
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateToPersonalDetails = () => {
    navigate('/personal-details')
  }

  const handleNavigateBack = () => {
    navigate('/dashboard/applicant')
  }

  const handleChangeLoanType = () => {
    navigate('/select-loan-type')
  }

  if (checkingPersonalDetails || loadingLoanType) {
    return (
      <LoadingState
        title="Loading Application"
        message="Please wait while we prepare your loan application..."
      />
    )
  }

  if (loading) {
    return (
      <LoadingState
        title="Submitting Application"
        message="Processing your application and sending confirmation email..."
      />
    )
  }

  if (!isPersonalDetailsComplete) {
    return (
      <PersonalDetailsRequired
        onNavigateToPersonalDetails={handleNavigateToPersonalDetails}
        onNavigateBack={handleNavigateBack}
      />
    )
  }

  const styles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <style>{styles}</style>
      
      <div className="max-w-7xl mx-auto relative">
        <div 
          className="text-center mb-12 relative"
          style={{ animation: 'fadeInUp 0.5s ease-out 0s both' }}
        >
          <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-wide">Loan Application</h1>
          <p className="text-lg text-gray-600 font-light tracking-wide">
            One step to get your loan approved
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-gray-900 to-gray-600 mx-auto mt-6"></div>
        </div>

        {cameFromPersonalDetails && (
          <div style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
            <SuccessMessage />
          </div>
        )}

        <div 
          id="loan-form"
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 relative overflow-hidden"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent rounded-bl-2xl opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-100 to-transparent rounded-tr-2xl opacity-40"></div>

          <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-light text-gray-900 mb-1">Loan Application Form</h2>
                <p className="text-sm text-gray-600 font-light">Please provide accurate loan details</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <span className="text-sm font-light text-gray-700">
                    Application
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8 lg:p-12 relative z-10">
            {error && <ErrorMessage message={error} />}

            {/* Pass validation errors to LoanForm */}
            <LoanForm
              loanTypeId={loanData.loanType}
              loanData={loanData}
              focusedField={focusedField}
              loading={loading}
              isFormValid={isFormValid()}
              validationErrors={validationErrors}
              selectedLoanType={selectedLoanType}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onChangeLoanType={handleChangeLoanType}
            />

            {personalDetails && selectedLoanType && (
              <ApplicationSummary
                personalDetails={personalDetails}
                loanData={loanData}
                selectedLoanType={selectedLoanType}
              />
            )}
          </div>
        </div>

        <div 
          className="mt-12 text-center"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
        >
          <button 
            onClick={() => navigate('/dashboard/applicant')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl font-light hover:from-black hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
          >
            <svg 
              width="20" 
              height="20" 
              className="mr-3 transition-transform duration-300 group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M7 16l-4-4m0 0l4-4m-4 4h18" 
              />
            </svg>
            Return to Dashboard
          </button>
        </div>

        <div 
          className="text-center mt-8 text-gray-500"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}
        >
          <p className="text-sm font-light tracking-wide">© 2025 LOANlo Financial Services. All rights reserved.</p>
          <p className="text-xs font-light mt-2">Secure • Professional • Confidential</p>
        </div>
      </div>
    </div>
  )
}

export default LoanApply