import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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

const KYC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [focusedField, setFocusedField] = useState<string>('')
  const [formData, setFormData] = useState<KYCData>({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    aadhaarNumber: '',
    panNumber: '',
    
    // Contact Information
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Employment Information
    employmentType: '',
    companyName: '',
    designation: '',
    workExperience: '',
    monthlyIncome: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isKYCComplete, setIsKYCComplete] = useState(false)
  // New state to track if KYC was just completed in this session
  const [showCongratulations, setShowCongratulations] = useState(false)

  // Fetch KYC details on mount and check if KYC is complete
  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5000/api/kyc/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.kyc) {
          setFormData((prev) => ({
            ...prev,
            ...data.kyc
          }))
          
          // Check if KYC is complete (all fields filled)
          const kycComplete = Object.entries(data.kyc).every(([key, value]) => {
            if (key in formData) {
              return value !== null && value !== undefined && value.toString().trim() !== ''
            }
            return true
          })
          
          setIsKYCComplete(kycComplete)
          // Don't set showCongratulations here - only show normal form
        }
      } catch (err) {
        console.error('Error fetching KYC:', err)
      }
    }
    fetchKYC()
  }, [])

  // Required fields validation by step
  const requiredFieldsByStep: { [key: number]: (keyof KYCData)[] } = {
    1: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus', 'aadhaarNumber', 'panNumber'],
    2: ['email', 'phone', 'address', 'city', 'state', 'pincode'],
    3: ['employmentType', 'companyName', 'designation', 'workExperience', 'monthlyIncome'],
  };

  const isStepValid = (step: number): boolean => {
    return requiredFieldsByStep[step].every(
      (field) => {
        const value = formData[field]?.toString().trim();
        return value !== '' && value !== undefined && value !== null;
      }
    );
  };

  // Get step status for color coding
  const getStepStatus = (step: number): 'completed' | 'current' | 'incomplete' => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'current'
    return 'incomplete'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField('')
  }

  const nextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!isStepValid(currentStep)) {
      setError('Please fill in all required fields before proceeding.');
      return;
    }
    
    setError('');
    await saveKYC();
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const saveKYC = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/kyc/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
    } catch (err) {
      console.error('Error saving KYC:', err)
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!isStepValid(currentStep)) {
      setError('Please fill in all required fields before submitting.');
      return;
    }
    
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/kyc/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsKYCComplete(true)
        // Set this flag to show congratulations message
        setShowCongratulations(true)
      } else {
        setError('KYC submission failed')
      }
    } catch (err) {
      setError('KYC submission failed')
    } finally {
      setLoading(false)
    }
  }

  const renderInputField = (
    name: keyof KYCData, 
    label: string, 
    type: string = 'text', 
    required: boolean = true, 
    maxLength?: number,
    min?: string
  ) => (
    <div className="relative group">
      <label className={`block text-sm font-semibold text-gray-800 mb-2 tracking-wide ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}>
        {label}
      </label>
      <div className={`relative transition-all duration-300 ${focusedField === name ? 'transform scale-[1.02]' : ''}`}>
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 bg-white border-2 rounded-lg font-medium text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none hover:border-gray-400 ${type === 'number' ? '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]' : ''} ${
            focusedField === name 
              ? 'border-gray-800 shadow-lg transform scale-[1.01]' 
              : 'border-gray-200 shadow-sm'
          }`}
          required={required}
          maxLength={maxLength}
          min={min}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 opacity-0 pointer-events-none transition-opacity duration-300 ${
          focusedField === name ? 'opacity-20' : ''
        }`}></div>
      </div>
    </div>
  )

  const renderSelectField = (
    name: keyof KYCData, 
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
          value={formData[name] || ''}
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
    name: keyof KYCData, 
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
          value={formData[name] || ''}
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
    name: keyof KYCData, 
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
            value={formData[name] || ''}
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

  const getStepTitle = (step: number): string => {
    const titles: { [key: number]: string } = {
      1: 'Personal Information',
      2: 'Contact Information', 
      3: 'Employment Information'
    }
    return titles[step]
  }

  const getStepDescription = (step: number): string => {
    const descriptions: { [key: number]: string } = {
      1: 'Please provide your personal details as they appear on official documents',
      2: 'Provide your current contact information and residential address',
      3: 'Share your employment and income details for verification'
    }
    return descriptions[step]
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">{getStepTitle(1)}</h3>
              <p className="text-gray-600 font-medium">{getStepDescription(1)}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderInputField('firstName', 'First Name')}
              {renderInputField('lastName', 'Last Name')}
              {renderInputField('dateOfBirth', 'Date of Birth', 'date')}
              {renderSelectField('gender', 'Gender', [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ])}
              {renderSelectField('maritalStatus', 'Marital Status', [
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'divorced', label: 'Divorced' },
                { value: 'widowed', label: 'Widowed' }
              ])}
              <div className="lg:col-span-2">
                {renderInputField('aadhaarNumber', 'Aadhaar Number', 'text', true, 12)}
              </div>
              <div className="lg:col-span-2">
                {renderInputField('panNumber', 'PAN Number', 'text', true, 10)}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">{getStepTitle(2)}</h3>
              <p className="text-gray-600 font-medium">{getStepDescription(2)}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderInputField('email', 'Email Address', 'email')}
              {renderInputField('phone', 'Phone Number', 'tel')}
              <div className="lg:col-span-2">
                {renderTextareaField('address', 'Residential Address')}
              </div>
              {renderInputField('city', 'City')}
              {renderInputField('state', 'State')}
              {renderInputField('pincode', 'Pincode', 'text', true, 6)}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">{getStepTitle(3)}</h3>
              <p className="text-gray-600 font-medium">{getStepDescription(3)}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderSelectField('employmentType', 'Employment Type', [
                { value: 'salaried', label: 'Salaried Employee' },
                { value: 'self_employed', label: 'Self Employed Professional' },
                { value: 'business', label: 'Business Owner' },
                { value: 'freelancer', label: 'Freelancer' }
              ])}
              {renderInputField('companyName', 'Company/Organization Name')}
              {renderInputField('designation', 'Job Title/Designation')}
              {renderInputField('workExperience', 'Work Experience (Years)', 'number', true, undefined, '0')}
              <div className="lg:col-span-2">
                {renderCurrencyField('monthlyIncome', 'Monthly Income', true, '0')}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Show congratulations screen only if KYC was just completed in this session
  if (showCongratulations && isKYCComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto relative">
          {/* Header Section */}
          <div className="text-center mb-12 relative">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-green-500 rounded-full mb-6 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">KYC Complete!</h1>
            <p className="text-xl text-gray-600 font-medium tracking-wide">Your verification is successful</p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-green-500 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Completion Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 lg:p-12 relative overflow-hidden">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Complete</h2>
              <p className="text-lg text-gray-600 mb-8">Your KYC details have been successfully verified. You can now proceed to apply for loans.</p>
              
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => navigate('/loan-application')}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="tracking-wide">APPLY FOR LOAN</span>
                  <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button 
                  onClick={() => {
                    setShowCongratulations(false)
                    setCurrentStep(1)
                  }}
                  className="inline-flex items-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="tracking-wide">UPDATE KYC</span>
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
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl font-bold text-white tracking-wider">KYC</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">Know Your Customer</h1>
          <p className="text-xl text-gray-600 font-medium tracking-wide">
            {isKYCComplete ? 'Update your verification details' : 'Complete your verification to proceed'}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 lg:p-12 relative overflow-hidden">
          {/* Subtle corner accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100 to-transparent rounded-tr-3xl opacity-50"></div>

          {/* Progress Section */}
          <div className="mb-12 relative z-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-wide">
                  {isKYCComplete ? 'Update KYC Details' : 'KYC Verification Progress'}
                </h2>
                <p className="text-gray-600 font-medium mt-1">
                  {isKYCComplete ? 'Modify your verification information' : 'Complete all sections for verification'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">{currentStep}</div>
                <div className="text-sm text-gray-500 font-semibold tracking-wide">OF 3 STEPS</div>
              </div>
            </div>
            
            {/* Enhanced Progress Bar with Status Colors */}
            <div className="relative bg-gray-200 rounded-full h-4 mb-8 shadow-inner overflow-hidden">
              {/* Completed sections - Green */}
              <div 
                className="absolute top-0 left-0 h-full bg-green-50 border-2 border-green-500 rounded-full transition-all duration-700 ease-in-out"         
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
              {/* Current section - Yellow */}
              {currentStep <= 3 && (
                <div 
                  className="absolute top-0 h-full bg-yellow-50 border-2 border-yellow-400 rounded-full transition-all duration-700 ease-in-out"
                  style={{ 
                    left: `${((currentStep - 1) / 3) * 100}%`,
                    width: `${100 / 3}%`
                  }}
                />
              )}
              {/* Status indicator line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>

            {/* Enhanced Step Indicators with Status Colors */}
            <div className="flex justify-between items-center">
              {[1, 2, 3].map((step) => {
                const status = getStepStatus(step)
                return (
                  <div key={step} className="flex flex-col items-center space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-3 shadow-lg relative overflow-hidden ${
                      status === 'completed'
                        ? 'bg-green-50 text-green-700 border-2 border-green-500 transform scale-105' 
                        : status === 'current'
                          ? 'bg-yellow-50 text-yellow-700 border-2 border-yellow-500 transform scale-110 transition-all duration-300'
                          : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-gray-400'
                    }`}>
                      {status === 'completed' ? (
                        <svg className="w-6 h-6 transition-transform duration-500 hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : status === 'current' ? (
                        <div className="flex items-center justify-center">
                          <span className="font-bold text-lg">{step}</span>
                        </div>
                      ) : (
                        <span className="font-bold">{step}</span>
                      )}
                    </div>
                    <div className="text-center">
                      <span className={`text-xs font-bold tracking-wider transition-colors duration-300 ${
                        status === 'completed' ? 'text-green-600' 
                        : status === 'current' ? 'text-yellow-600' 
                        : 'text-red-400'
                      }`}>
                        {step === 1 ? 'PERSONAL' : step === 2 ? 'CONTACT' : 'EMPLOYMENT'}
                      </span>
                      {/* Status indicator */}
                      <div className={`w-2 h-2 rounded-full mx-auto mt-1 transition-colors duration-300 ${
                        status === 'completed' ? 'bg-green-500 shadow-lg shadow-green-200' 
                        : status === 'current' ? 'bg-yellow-400 shadow-lg shadow-yellow-200 animate-pulse' 
                        : 'bg-red-300'
                      }`}></div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Overall Progress Status */}
            <div className="mt-6 text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                currentStep === 1 ? 'bg-red-50/30 text-red-700 border-2 border-red-300' 
                : currentStep < 3 ? 'bg-yellow-50/30 text-yellow-700 border-2 border-yellow-300'
                : 'bg-green-50/30 text-green-700 border-2 border-green-300'
              }`}>
                {currentStep === 1 && (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    {isKYCComplete ? 'Updating Personal Details' : 'Getting Started - Personal Details Required'}
                  </>
                )}
                {currentStep > 1 && currentStep < 3 && (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    {isKYCComplete ? `Updating Details - ${Math.round(((currentStep - 1) / 3) * 100)}% Complete` : `In Progress - ${Math.round(((currentStep - 1) / 3) * 100)}% Complete`}
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {isKYCComplete ? 'Finalizing Updates' : 'Almost Done - Final Step'}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Error Display with Red Status */}
          {error && (
              <div className="mb-8 p-4 bg-red-50/20 border-2 border-red-400 rounded-lg animate-shake">
                <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
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
          <form onSubmit={(e) => currentStep === 3 ? handleSubmit(e) : e.preventDefault()} className="relative z-10">
            {renderStep()}

            {/* Enhanced Navigation Buttons with Status Colors */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              {currentStep > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="inline-flex items-center px-8 py-4 bg-white border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="tracking-wide">PREVIOUS</span>
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 3 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold tracking-wide focus:outline-none focus:ring-4 transition-all duration-200 transform shadow-lg relative overflow-hidden ${
                    isStepValid(currentStep)
                    ? 'bg-green-50 border-2 border-green-600 text-green-700 hover:bg-green-100 hover:border-green-700 hover:scale-105 focus:ring-4 focus:ring-green-200'
                    : 'bg-red-50/30 border-2 border-red-400 text-red-600 cursor-not-allowed'
                  }`}
                >
                  {!isStepValid(currentStep) && (
                    <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
                  )}
                  <span>CONTINUE</span>
                  <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {isStepValid(currentStep) && (
                    <div className="absolute inset-0 bg-white/10 animate-ping rounded-xl"></div>
                  )}
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading || !isStepValid(currentStep)}
                  className={`inline-flex items-center px-12 py-4 rounded-xl font-bold tracking-wide focus:outline-none focus:ring-4 transition-all duration-200 transform shadow-xl relative overflow-hidden ${
                  loading || !isStepValid(currentStep)
                    ? 'bg-red-50/30 border-2 border-red-400 text-red-600 cursor-not-allowed'
                    : 'bg-green-50 border-2 border-green-700 text-green-800 hover:bg-green-100 hover:border-green-800 hover:scale-105 focus:ring-4 focus:ring-green-200'
                  }`}
                >
                  {loading && (
                    <div className="absolute inset-0 bg-yellow-400/30 animate-pulse"></div>
                  )}
                  {!isStepValid(currentStep) && !loading && (
                    <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
                  )}
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{isKYCComplete ? 'UPDATING...' : 'SUBMITTING...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isKYCComplete ? 'UPDATE KYC' : 'COMPLETE KYC'}</span>
                      <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isStepValid(currentStep) && (
                        <div className="absolute inset-0 bg-white/10 animate-ping rounded-xl"></div>
                      )}
                    </>
                  )}
                </button>
              )}
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

export default KYC