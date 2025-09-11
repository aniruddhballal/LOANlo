import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

// Import types and constants
import type { PersonalDetailsData } from './types';
import { REQUIRED_FIELDS_BY_STEP, INITIAL_PERSONAL_DETAILS_DATA } from './constants';

// Import components
import ProgressBar from './ProgressBar';
import { PersonalInfoStep, ContactInfoStep, EmploymentInfoStep, validateStep } from './PersonalDetailsSteps';
import { LoadingState, ApplicationSuccess } from '../../ui/StatusMessages';

import { isProfileComplete } from '../../../../../shared/validation';

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

  useEffect(() => {
    const fetchPersonalDetails = async () => {
      try {
        setInitialLoading(true);
        const { data } = await api.get('/profile/me');
        if (data.user) {
          setFormData(prev => ({ ...prev, ...data.user }));

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
  }, [currentStep, error]);

  // Enhanced validation function using the new validateStep function
  const isStepValid = (step: number): boolean => {
    return validateStep(step, formData, REQUIRED_FIELDS_BY_STEP);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    navigate('/loan-application', { state: { fromProfileSetup: true } });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-wide">Personal Information</h1>
          <p className="text-lg text-gray-600 font-light tracking-wide">
            Complete your details to proceed with loan applications
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-gray-900 to-gray-600 mx-auto mt-6"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 relative overflow-hidden">
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
              <div className="mb-8 p-6 bg-red-50/30 border-2 border-red-400 rounded-xl animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-light text-red-800">{error}</p>
                  </div>
                </div>
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
                    onClick={() => {
                      if (isStepValid(currentStep)) prevStep();
                    }}
                    disabled={!isStepValid(currentStep)}
                    className={`inline-flex items-center px-8 py-4 rounded-xl font-light tracking-wide focus:outline-none focus:ring-4 transition-all duration-200 transform shadow-lg relative overflow-hidden ${
                      isStepValid(currentStep)
                        ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:scale-105'
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
                    className={`inline-flex items-center px-8 py-4 rounded-xl font-light tracking-wide focus:outline-none focus:ring-4 transition-all duration-200 transform shadow-lg relative overflow-hidden ${
                      isStepValid(currentStep)
                      ? 'bg-green-50 border-2 border-green-600 text-green-700 hover:bg-green-100 hover:border-green-700 hover:scale-105 focus:ring-4 focus:ring-green-200'
                      : 'bg-red-50/30 border-2 border-red-400 text-red-600 cursor-not-allowed opacity-60'
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
                    className={`inline-flex items-center px-12 py-4 rounded-xl font-light tracking-wide focus:outline-none focus:ring-4 transition-all duration-200 transform shadow-xl relative overflow-hidden ${
                    loading || !isStepValid(currentStep)
                      ? 'bg-red-50/30 border-2 border-red-400 text-red-600 cursor-not-allowed opacity-60'
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
                        <span>{isPersonalDetailsComplete ? 'UPDATING...' : 'SUBMITTING...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isPersonalDetailsComplete ? 'UPDATE DETAILS' : 'SUBMIT DETAILS'}</span>
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
        </div>

        {/* Call to Action - Dashboard style with original flair */}
        {isPersonalDetailsComplete && (
          <div className="mt-12 text-center">
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
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm font-light tracking-wide">© 2025 LOANlo Financial Services. All rights reserved.</p>
          <p className="text-xs font-light mt-2">Secure • Professional • Confidential</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;