import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LoanApplication = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        // Redirect to document upload page
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>Personal Information</h3>
            <div>
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Gender:</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label>Marital Status:</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} required>
                <option value="">Select Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <div>
              <label>Aadhaar Number:</label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                maxLength={12}
                required
              />
            </div>
            <div>
              <label>PAN Number:</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                maxLength={10}
                required
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div>
            <h3>Contact Information</h3>
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Address:</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>City:</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>State:</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Pincode:</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                required
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div>
            <h3>Employment Information</h3>
            <div>
              <label>Employment Type:</label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange} required>
                <option value="">Select Type</option>
                <option value="salaried">Salaried</option>
                <option value="self_employed">Self Employed</option>
                <option value="business">Business</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>
            <div>
              <label>Company Name:</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Designation:</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Work Experience (years):</label>
              <input
                type="number"
                name="workExperience"
                value={formData.workExperience}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div>
              <label>Monthly Income (₹):</label>
              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div>
            <h3>Loan Information</h3>
            <div>
              <label>Loan Type:</label>
              <select name="loanType" value={formData.loanType} onChange={handleChange} required>
                <option value="">Select Loan Type</option>
                <option value="personal">Personal Loan</option>
                <option value="home">Home Loan</option>
                <option value="vehicle">Vehicle Loan</option>
                <option value="business">Business Loan</option>
                <option value="education">Education Loan</option>
              </select>
            </div>
            <div>
              <label>Loan Amount (₹):</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="1000"
                required
              />
            </div>
            <div>
              <label>Purpose:</label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Tenure (months):</label>
              <select name="tenure" value={formData.tenure} onChange={handleChange} required>
                <option value="">Select Tenure</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
                <option value="48">48 months</option>
                <option value="60">60 months</option>
                <option value="84">84 months</option>
                <option value="120">120 months</option>
              </select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <h2>Loan Application</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <div>Step {currentStep} of 4</div>
        <div style={{ width: '100%', backgroundColor: '#f0f0f0', height: '10px' }}>
          <div 
            style={{ 
              width: `${(currentStep / 4) * 100}%`, 
              backgroundColor: '#007bff', 
              height: '100%' 
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={(e) => currentStep === 4 ? handleSubmit(e) : e.preventDefault()}>
        {renderStep()}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          {currentStep > 1 && (
            <button type="button" onClick={prevStep}>
              Previous
            </button>
          )}
          
          {currentStep < 4 ? (
            <button type="button" onClick={nextStep} style={{ marginLeft: 'auto' }}>
              Next
            </button>
          ) : (
            <button type="submit" disabled={loading} style={{ marginLeft: 'auto' }}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoanApplication