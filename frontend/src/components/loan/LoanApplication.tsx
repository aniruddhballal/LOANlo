import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './loanapplication.module.css'

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
  const requiredFieldsByStep: { [key: number]: string[] } = {
    1: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus', 'aadhaarNumber', 'panNumber'],
    2: ['email', 'phone', 'address', 'city', 'state', 'pincode'],
    3: ['employmentType', 'companyName', 'designation', 'workExperience', 'monthlyIncome'],
    4: ['loanType', 'amount', 'purpose', 'tenure'],
  };

  const isStepValid = (step: number) => {
    return requiredFieldsByStep[step].every(
      (field) => {
        const value = formData[field as keyof typeof formData]?.toString().trim();
        return value !== '' && value !== undefined && value !== null;
      }
    );
  };

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

  const nextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Prevent navigation if current step is not valid
    if (!isStepValid(currentStep)) {
      setError('Please fill in all required fields before proceeding.');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Save KYC on every step except the last (loan info)
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
      const kycData: any = {};
      kycFields.forEach(field => kycData[field] = formData[field as keyof typeof formData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent submission if current step is not valid
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
    name: string, 
    label: string, 
    type: string = 'text', 
    required: boolean = true, 
    maxLength?: number,
    min?: string
  ) => (
    <div className={styles.inputGroup}>
      <label className={`${styles.label} ${required ? styles.required : ''}`}>
        {label}
      </label>
      <div className={`${styles.inputWrapper} ${focusedField === name ? styles.focused : ''}`}>
        <input
          type={type}
          name={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          className={styles.input}
          required={required}
          maxLength={maxLength}
          min={min}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </div>
  )

  const renderSelectField = (
    name: string, 
    label: string, 
    options: { value: string; label: string }[], 
    required: boolean = true
  ) => (
    <div className={styles.inputGroup}>
      <label className={`${styles.label} ${required ? styles.required : ''}`}>
        {label}
      </label>
      <div className={`${styles.inputWrapper} ${focusedField === name ? styles.focused : ''}`}>
        <select
          name={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          className={styles.select}
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )

  const renderTextareaField = (
    name: string, 
    label: string, 
    required: boolean = true
  ) => (
    <div className={styles.inputGroup}>
      <label className={`${styles.label} ${required ? styles.required : ''}`}>
        {label}
      </label>
      <div className={`${styles.inputWrapper} ${focusedField === name ? styles.focused : ''}`}>
        <textarea
          name={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          className={styles.textarea}
          required={required}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </div>
  )

  const renderCurrencyField = (
    name: string, 
    label: string, 
    required: boolean = true,
    min?: string
  ) => (
    <div className={styles.inputGroup}>
      <label className={`${styles.label} ${required ? styles.required : ''}`}>
        {label}
      </label>
      <div className={`${styles.inputWrapper} ${styles.currencyInput} ${focusedField === name ? styles.focused : ''}`}>
        <span className={styles.currencySymbol}>₹</span>
        <input
          type="number"
          name={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          onFocus={() => handleFocus(name)}
          onBlur={handleBlur}
          className={styles.input}
          required={required}
          min={min}
          placeholder="0"
        />
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Personal Information</h3>
            <div className={styles.formGrid}>
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
              <div className={styles.fullWidth}>
                {renderInputField('aadhaarNumber', 'Aadhaar Number', 'text', true, 12)}
              </div>
              <div className={styles.fullWidth}>
                {renderInputField('panNumber', 'PAN Number', 'text', true, 10)}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Contact Information</h3>
            <div className={styles.formGrid}>
              {renderInputField('email', 'Email', 'email')}
              {renderInputField('phone', 'Phone Number', 'tel')}
              <div className={styles.fullWidth}>
                {renderTextareaField('address', 'Address')}
              </div>
              {renderInputField('city', 'City')}
              {renderInputField('state', 'State')}
              {renderInputField('pincode', 'Pincode', 'text', true, 6)}
            </div>
          </div>
        )

      case 3:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Employment Information</h3>
            <div className={styles.formGrid}>
              {renderSelectField('employmentType', 'Employment Type', [
                { value: 'salaried', label: 'Salaried' },
                { value: 'self_employed', label: 'Self Employed' },
                { value: 'business', label: 'Business' },
                { value: 'freelancer', label: 'Freelancer' }
              ])}
              {renderInputField('companyName', 'Company Name')}
              {renderInputField('designation', 'Designation')}
              {renderInputField('workExperience', 'Work Experience (years)', 'number', true, undefined, '0')}
              <div className={styles.fullWidth}>
                {renderCurrencyField('monthlyIncome', 'Monthly Income', true, '0')}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Loan Information</h3>
            <div className={styles.formGridSingle}>
              {renderSelectField('loanType', 'Loan Type', [
                { value: 'personal', label: 'Personal Loan' },
                { value: 'home', label: 'Home Loan' },
                { value: 'vehicle', label: 'Vehicle Loan' },
                { value: 'business', label: 'Business Loan' },
                { value: 'education', label: 'Education Loan' }
              ])}
              {renderCurrencyField('amount', 'Loan Amount', true, '1000')}
              {renderSelectField('tenure', 'Tenure', [
                { value: '6', label: '6 months' },
                { value: '12', label: '12 months' },
                { value: '24', label: '24 months' },
                { value: '36', label: '36 months' },
                { value: '48', label: '48 months' },
                { value: '60', label: '60 months' },
                { value: '84', label: '84 months' },
                { value: '120', label: '120 months' }
              ])}
              {renderTextareaField('purpose', 'Purpose')}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>
      </div>

      <div className={styles.mainCard}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.logo}>LOANalo</h1>
          <p className={styles.subtitle}>Loan Application Portal</p>
        </div>

        <div className={styles.glassCard}>
          {/* Progress Section */}
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <h2 className={styles.progressTitle}>KYC Progress</h2>
              <div className={styles.stepIndicator}>
                Step {currentStep} of 4
              </div>
            </div>
            
            <div className={styles.progressBarContainer}>
              <div 
                className={styles.progressBar}
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            <div className={styles.stepDots}>
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step}
                  className={`${styles.stepDot} ${
                    step === currentStep ? styles.active : 
                    step < currentStep ? styles.completed : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className={styles.errorContainer}>
              <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className={styles.errorText}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => currentStep === 4 ? handleSubmit(e) : e.preventDefault()}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className={styles.navigationButtons}>
              {currentStep > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className={`${styles.navButton} ${styles.prevButton}`}
                >
                  <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className={styles.buttonText}>Previous</span>
                </button>
              ) : (
                <div className={styles.spacer}></div>
              )}
              
              {currentStep < 4 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className={`${styles.navButton} ${styles.nextButton}`}
                  disabled={!isStepValid(currentStep)}
                >
                  <span className={styles.buttonText}>Next</span>
                  <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading || !isStepValid(currentStep)}
                  className={`${styles.submitButton}`}
                >
                  {loading ? (
                    <>
                      <div className={styles.spinner}></div>
                      <span className={styles.buttonText}>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.buttonText}>Submit KYC Application</span>
                      <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 2 21 20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>                      
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoanApplication