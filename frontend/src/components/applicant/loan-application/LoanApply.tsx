import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../../api'
import { LoadingState, ErrorMessage, SuccessMessage } from '../../ui/StatusMessages'
import { PersonalDetailsRequired } from './PersonalDetailsRequired'
import { LoanForm } from './LoanForm'
import { ApplicationSummary } from './ApplicationSummary'

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
  const [personalDetails, setPersonalDetails] = useState<PersonalDetailsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPersonalDetailsComplete, setIsPersonalDetailsComplete] = useState(false)
  const [checkingPersonalDetails, setCheckingPersonalDetails] = useState(true)

  // Check if user came from Personal Details page
  const cameFromPersonalDetails = location.state?.fromPersonalDetails === true

  // Get selected loan type from navigation state
  useEffect(() => {
    const selectedLoanType = location.state?.selectedLoanType
    if (selectedLoanType) {
      setLoanData(prev => ({
        ...prev,
        loanType: selectedLoanType
      }))
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
      const applicationData = { ...personalDetails, ...loanData }
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

  // Get loan type display name
  const getLoanTypeDisplay = (type: string) => {
    const loanTypes: { [key: string]: string } = {
      'personal': 'Personal Loan',
      'home': 'Home Loan',
      'education': 'Education Loan',
      'business': 'Business Loan',
      'vehicle': 'Vehicle Loan',
      'gold': 'Gold Loan'
    }
    return loanTypes[type] || type
  }

  // Loading state while checking Personal Details Completion
  if (checkingPersonalDetails) {
    return (
      <LoadingState
        title="Verifying Personal Details"
        message="Please wait while we confirm your information..."
      />
    )
  }

  // Loading state while submitting application
  if (loading) {
    return (
      <LoadingState
        title="Submitting Application"
        message="Processing your application and sending confirmation email..."
      />
    )
  }

  // If Personal Details is not complete, show message to complete Personal Details first
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
        {/* Header Section */}
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

        {/* Personal Details Status Card */}
        {cameFromPersonalDetails && (
          <div style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
            <SuccessMessage />
          </div>
        )}

        {/* Selected Loan Type Badge */}
        {loanData.loanType && (
          <div 
            className="mb-6 flex justify-center"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
          >
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl px-6 py-3 shadow-sm">
              <span className="text-sm text-gray-600 font-light mr-2">Selected Loan:</span>
              <span className="text-base text-gray-900 font-medium mr-4">{getLoanTypeDisplay(loanData.loanType)}</span>
              <button
                onClick={handleChangeLoanType}
                className="text-sm text-gray-600 hover:text-gray-900 underline font-light"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div 
          id="loan-form"
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 relative overflow-hidden"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
        >
          {/* Subtle corner accents */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent rounded-bl-2xl opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-100 to-transparent rounded-tr-2xl opacity-40"></div>

          {/* Header section matching dashboard style */}
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
            {/* Error Display */}
            {error && <ErrorMessage message={error} />}

            {/* Form Content */}
            <LoanForm
              loanData={loanData}
              focusedField={focusedField}
              loading={loading}
              isFormValid={isFormValid()}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />

            {/* Summary Section */}
            {personalDetails && (
              <ApplicationSummary
                personalDetails={personalDetails}
                loanData={loanData}
              />
            )}
          </div>
        </div>

        {/* Call to Action - Dashboard style with original flair */}
        <div 
          className="mt-12 text-center"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}
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

        {/* Footer */}
        <div 
          className="text-center mt-8 text-gray-500"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.5s both' }}
        >
          <p className="text-sm font-light tracking-wide">© 2025 LOANlo Financial Services. All rights reserved.</p>
          <p className="text-xs font-light mt-2">Secure • Professional • Confidential</p>
        </div>
      </div>
    </div>
  )
}

export default LoanApply