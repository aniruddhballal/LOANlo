import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const LoanApplication = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [focusedField, setFocusedField] = useState('')
  const [formData, setFormData] = useState({
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
    monthlyIncome: '',
    
    // Loan Information
    loanType: '',
    amount: '',
    purpose: '',
    tenure: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch KYC details on mount and prefill formData if available
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
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchKYC()
  }, [])

  // Required fields validation by step
  const requiredFieldsByStep = {
    1: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus', 'aadhaarNumber', 'panNumber'],
    2: ['email', 'phone', 'address', 'city', 'state', 'pincode'],
    3: ['employmentType', 'companyName', 'designation', 'workExperience', 'monthlyIncome'],
    4: ['loanType', 'amount', 'purpose', 'tenure'],
  };

  const isStepValid = (step) => {
    return requiredFieldsByStep[step].every(
      (field) => {
        const value = formData[field]?.toString().trim();
        return value !== '' && value !== undefined && value !== null;
      }
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField('')
  }

  const nextStep = async (e) => {
    e.preventDefault();
    
    if (!isStepValid(currentStep)) {
      setError('Please fill in all required fields before proceeding.');
      return;
    }
    
    setError('');
    
    if (currentStep >= 1 && currentStep <= 3) {
      await saveKYC();
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const saveKYC = async () => {
    try {
      const token = localStorage.getItem('token');
      const kycFields = [
        'firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus',
        'aadhaarNumber', 'panNumber', 'email', 'phone', 'address', 'city',
        'state', 'pincode', 'employmentType', 'companyName', 'designation',
        'workExperience', 'monthlyIncome'
      ];
      const kycData = {};
      kycFields.forEach(field => kycData[field] = formData[field]);

      await fetch('http://localhost:5000/api/kyc/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(kycData)
      });
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isStepValid(currentStep)) {
      setError('Please fill in all required fields before submitting.');
      return;
    }
    
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/loans/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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

  const renderInputField = (
    name, 
    label, 
    type = 'text', 
    required = true, 
    maxLength,
    min
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
          className={`w-full px-4 py-3 bg-white border-2 rounded-lg font-medium text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none hover:border-gray-400 ${
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
    name, 
    label, 
    options, 
    required = true
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
          className={`w-full px-4 py-3 bg-white border-2 rounded-lg font-medium text-gray-800 transition-all duration-300 focus:outline-none hover:border-gray-400 cursor-pointer ${
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
    name, 
    label, 
    required = true
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
          rows="4"
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
    name, 
    label, 
    required = true,
    min
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
            className="flex-1 px-4 py-3 bg-transparent font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
            required={required}
            min={min}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  )

  const getStepTitle = (step) => {
    const titles = {
      1: 'Personal Information',
      2: 'Contact Information', 
      3: 'Employment Information',
      4: 'Loan Information'
    }
    return titles[step]
  }

  const getStepDescription = (step) => {
    const descriptions = {
      1: 'Please provide your personal details as they appear on official documents',
      2: 'Provide your current contact information and residential address',
      3: 'Share your employment and income details for verification',
      4: 'Specify your loan requirements and intended purpose'
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

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center border-b pb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">{getStepTitle(4)}</h3>
              <p className="text-gray-600 font-medium">{getStepDescription(4)}</p>
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
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="black" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-600 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl font-bold text-white tracking-wider">LO</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">LOANlo</h1>
          <p className="text-xl text-gray-600 font-medium tracking-wide">Professional Loan Application Portal</p>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 lg:p-12 relative overflow-hidden">
          {/* Subtle corner accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent rounded-bl-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-gray-100 to-transparent rounded-tr-3xl opacity-50"></div>

          {/* Progress Section */}
          <div className="mb-12 relative z-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-wide">Application Progress</h2>
                <p className="text-gray-600 font-medium mt-1">Complete all sections to proceed</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">{currentStep}</div>
                <div className="text-sm text-gray-500 font-semibold tracking-wide">OF 4 STEPS</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative bg-gray-200 rounded-full h-3 mb-8 shadow-inner">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-800 to-gray-600 rounded-full transition-all duration-700 ease-in-out shadow-lg"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                    step === currentStep 
                      ? 'bg-gray-800 text-white border-gray-800 shadow-lg transform scale-110' 
                      : step < currentStep 
                      ? 'bg-gray-700 text-white border-gray-700 shadow-md' 
                      : 'bg-white text-gray-400 border-gray-300 hover:border-gray-400'
                  }`}>
                    {step < currentStep ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <span className={`text-xs font-semibold tracking-wide ${
                    step === currentStep ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {step === 1 ? 'PERSONAL' : step === 2 ? 'CONTACT' : step === 3 ? 'EMPLOYMENT' : 'LOAN'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
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
          <form onSubmit={(e) => currentStep === 4 ? handleSubmit(e) : e.preventDefault()} className="relative z-10">
            {renderStep()}

            {/* Navigation Buttons */}
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
              
              {currentStep < 4 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold tracking-wide focus:outline-none focus:ring-4 transition-all duration-200 transform shadow-lg ${
                    isStepValid(currentStep)
                      ? 'bg-gradient-to-r from-gray-800 to-gray-600 text-white hover:from-gray-700 hover:to-gray-500 hover:scale-105 hover:shadow-xl focus:ring-gray-300'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>CONTINUE</span>
                  <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading || !isStepValid(currentStep)}
                  className={`inline-flex items-center px-12 py-4 rounded-xl font-bold tracking-wide focus:outline-none focus:ring-4 transition-all duration-200 transform shadow-xl ${
                    loading || !isStepValid(currentStep)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 hover:scale-105 hover:shadow-2xl focus:ring-gray-300'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>SUBMITTING...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT APPLICATION</span>
                      <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>                      
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

export default LoanApplication