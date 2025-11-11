import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

// Import types and constants
import type { PersonalDetailsData } from './types';
import { REQUIRED_FIELDS_BY_STEP, INITIAL_PERSONAL_DETAILS_DATA } from './constants';

// Import components
import ProgressBar from './ProgressBar';
import { PersonalInfoStep, ContactInfoStep, EmploymentInfoStep, validateStep } from './PersonalDetailsSteps';
import { LoadingState, ApplicationSuccess, ErrorMessage } from '../../ui/StatusMessages';

import { isProfileComplete } from '../../../../../backend/src/shared/validation';

const PersonalDetails = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [focusedField, setFocusedField] = useState<string>('');
  const [formData, setFormData] = useState<PersonalDetailsData>(INITIAL_PERSONAL_DETAILS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPersonalDetailsComplete, setIsPersonalDetailsComplete] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchPersonalDetails = async () => {
      try {
        setInitialLoading(true);
        const { data } = await api.get('/profile/me');
        if (data.user) {
          setFormData(prev => ({ ...prev, ...data.user }));
          setIsEmailVerified(data.user.isEmailVerified ?? false);
          
          const detailsComplete = isProfileComplete(data.user);
          setIsPersonalDetailsComplete(detailsComplete);
        }
      } catch (err: any) {
        console.error('Error fetching Personal Details:', err.response?.data?.message || err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchPersonalDetails();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  useEffect(() => {
    if (error && errorRef.current) {
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [error]);

  // Enhanced validation function using the new validateStep function
  const isStepValid = (step: number): boolean => {
    return validateStep(step, formData, REQUIRED_FIELDS_BY_STEP);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const nextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!isStepValid(currentStep)) {
      setError('Please fill in all required fields with valid information before proceeding.');
      return;
    }

    setError("");
    const success = await savePersonalDetails();

    if (success && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const savePersonalDetails = async (): Promise<boolean> => {
    try {
      await api.post("/profile/save", formData);
      return true;
    } catch (err: any) {
      console.error(
        "Error saving Personal Details:",
        err.response?.data?.message || err
      );
      setError(err.response?.data?.message || "Failed to save details");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isStepValid(currentStep)) {
      setError('Please fill in all required fields with valid information before submitting.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/profile/save', formData);

      // If backend returns the updated profile completion status
      if (res.data.success) {
        setIsPersonalDetailsComplete(res.data.isProfileComplete); // sync local state
        setShowCongratulations(true);
      } else {
        setError(res.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'PII submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToLoan = () => {
    navigate('/apply-loan', { state: { fromProfileSetup: true } });
  };

  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      focusedField,
      onFieldChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur
    };

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...stepProps} />;
      case 2:
        return <ContactInfoStep {...stepProps} />;
      case 3:
        return <EmploymentInfoStep {...stepProps} />;
      default:
        return null;
    }
  };

  // Show congratulations screen only if Personal Details was just completed in this session
  if (showCongratulations && isPersonalDetailsComplete) {
    return <ApplicationSuccess onNavigateToLoan={handleNavigateToLoan} />;
  }

  // Show loading screen while fetching initial data
  if (initialLoading) {
    return (
      <LoadingState
        title="Loading Personal Details"
        message="Please wait while we fetch your information..."
      />
    )
  }

  // Redirect if email is not verified
  if (isEmailVerified === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-red-200 p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="17" cy="17" r="4" fill="#DC2626"/>
              <path d="M17 15v2M17 19h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-3xl font-light text-gray-900 mb-4">Email Verification Required</h2>
          <p className="text-lg text-gray-600 font-light mb-8">
            Please verify your email address before accessing personal details. Check your inbox for the verification link.
          </p>
          <button
            onClick={() => navigate('/dashboard/applicant')}
            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-xl font-light hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg width="20" height="20" className="mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
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
      
      <div className="max-w-4xl mx-auto relative">
        {/* Header Section */}
        <div 
          className="text-center mb-12 relative"
          style={{ animation: 'fadeInUp 0.5s ease-out 0s both' }}
        >
          <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-wide">Personal Information</h1>
          <p className="text-lg text-gray-600 font-light tracking-wide">
            Complete your details to proceed with loan applications
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-gray-900 to-gray-600 mx-auto mt-6"></div>
        </div>

        {/* Main Card */}
        <div 
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 relative overflow-hidden"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
        >
          {/* Subtle corner accents */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent rounded-bl-2xl opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-100 to-transparent rounded-tr-2xl opacity-40"></div>

          {/* Header section matching dashboard style */}
          <header className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 relative z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-light text-gray-900 mb-1">Personal Details Form</h2>
                <p className="text-sm text-gray-600 font-light">Step {currentStep} of 3 - Please provide accurate information</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <span className="text-sm font-light text-gray-700">
                    Step {currentStep}/3
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8 lg:p-12 relative z-10">
            {/* Progress Section */}
            <ProgressBar currentStep={currentStep} />

            {/* Error Display */}
            {error && (
              <div
                ref={errorRef}
                className="bg-red-50 border border-red-400 text-red-800 rounded-xl px-6 py-4 my-6 shadow-sm"
              >
                <ErrorMessage message={error} />
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={(e) => currentStep === 3 ? handleSubmit(e) : e.preventDefault()} className="relative z-10">
              {renderCurrentStep()}

            {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
                {currentStep > 1 ? (
                  <button 
                    type="button" 
                    onClick={(e) => {
                      if (isStepValid(currentStep)) {
                        prevStep();
                        e.currentTarget.blur();
                      }
                    }}
                    disabled={!isStepValid(currentStep)}
                    className={`inline-flex items-center px-8 py-4 rounded-xl font-light tracking-wide focus:outline-none focus:ring-4 transition-all duration-200 transform shadow-lg relative overflow-hidden ${
                      isStepValid(currentStep)
                        ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:scale-105 cursor-pointer'
                        : 'bg-red-50/30 border-2 border-red-400 text-red-600 cursor-not-allowed opacity-60'
                    }`}
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
                    className={`group relative cursor-pointer border-none font-light overflow-hidden rounded-xl ${
                      isStepValid(currentStep)
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed opacity-60'
                    }`}
                    style={{
                      background: 'transparent'
                    }}
                  >
                    {/* Rotating gradient border */}
                    {isStepValid(currentStep) && (
                      <div 
                        className="absolute inset-0 transition-transform group-hover:rotate-180"
                        style={{
                          background: 'linear-gradient(to right, #10b981, #22c55e, #34d399)',
                          borderRadius: '0.75rem',
                          transitionDuration: '600ms',
                          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        }}
                      />
                    )}
                    
                    {/* Disabled state background */}
                    {!isStepValid(currentStep) && (
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: '#fca5a5',
                          borderRadius: '0.75rem'
                        }}
                      />
                    )}
                    
                    {/* Inner button content */}
                    <span 
                      className={`relative z-10 flex items-center px-8 py-4 m-[3px] rounded-[0.6875rem] tracking-wide ${
                        isStepValid(currentStep)
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50/30 text-red-600'
                      }`}
                    >
                      <span>SAVE & CONTINUE</span>
                      <svg
                        className="w-5 h-5 ml-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isStepValid(currentStep)}
                    className={`group relative cursor-pointer border-none font-light overflow-hidden rounded-xl ${
                      loading || !isStepValid(currentStep)
                      ? 'cursor-not-allowed opacity-60'
                      : 'cursor-pointer'
                    }`}
                    style={{
                      background: 'transparent'
                    }}
                  >
                    {/* Rotating gradient border */}
                    {!loading && isStepValid(currentStep) && (
                      <div
                        className="absolute inset-0 transition-transform group-hover:rotate-180"
                        style={{
                          background: 'linear-gradient(to right, #10b981, #22c55e, #34d399)',
                          borderRadius: '0.75rem',
                          transitionDuration: '600ms',
                          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        }}
                      />
                    )}
                    
                    {/* Loading state background */}
                    {loading && (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: '#fcd34d',
                          borderRadius: '0.75rem'
                        }}
                      />
                    )}
                   
                    {/* Disabled state background */}
                    {!loading && !isStepValid(currentStep) && (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: '#fca5a5',
                          borderRadius: '0.75rem'
                        }}
                      />
                    )}
                   
                    {/* Inner button content */}
                    <span
                      className={`relative z-10 flex items-center px-12 py-4 m-[3px] rounded-[0.6875rem] tracking-wide ${
                        loading
                        ? 'bg-yellow-50 text-yellow-700'
                        : !isStepValid(currentStep)
                        ? 'bg-red-50/30 text-red-600'
                        : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{isPersonalDetailsComplete ? 'UPDATING...' : 'SUBMITTING...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isPersonalDetailsComplete ? 'UPDATE DETAILS' : 'SUBMIT DETAILS'}</span>
                          <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Call to Action - Dashboard style with original flair */}
        {isPersonalDetailsComplete && (
          <div 
            className="mt-12 text-center"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
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
        )}

        {/* Footer */}
        <div 
          className="text-center mt-8 text-gray-500"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
        >
          <p className="text-sm font-light tracking-wide">© 2025 LOANlo Financial Services. All rights reserved.</p>
          <p className="text-xs font-light mt-2">Secure • Professional • Confidential</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;