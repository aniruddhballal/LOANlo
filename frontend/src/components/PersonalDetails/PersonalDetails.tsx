import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

// Import types and constants
import type { PersonalDetailsData } from './types';
import { REQUIRED_FIELDS_BY_STEP, INITIAL_PERSONAL_DETAILS_DATA } from './constants';

// Import components
import ProgressBar from './ProgressBar';
import { PersonalInfoStep, ContactInfoStep, EmploymentInfoStep } from './PersonalDetailsSteps';
import { LoadingScreen, CongratulationsScreen } from './LoadingScreens';

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

          const detailsComplete = Object.entries(data.user).every(([key, value]) => {
            if (key in formData) {
              return value !== null && value !== undefined && value.toString().trim() !== '';
            }
            return true;
          });

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

  const isStepValid = (step: number): boolean => {
    return REQUIRED_FIELDS_BY_STEP[step].every((field) => {
      const value = formData[field]?.toString().trim();
      return value !== '' && value !== undefined && value !== null;
    });
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
      setError('Please fill in all required fields before proceeding.');
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
      setError('Please fill in all required fields before submitting.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await api.post('/profile/save', formData);
      setIsPersonalDetailsComplete(true);
      setShowCongratulations(true);
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
    return <CongratulationsScreen onNavigateToLoan={handleNavigateToLoan} />;
  }

  // Show loading screen while fetching initial data
  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl font-bold text-white tracking-wider">PII</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">Personally Identifiable Information</h1>
          <p className="text-xl text-gray-600 font-medium tracking-wide">
            Fill in your details to proceed
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 lg:p-12 relative overflow-hidden">
          {/* Subtle corner accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100 to-transparent rounded-tr-3xl opacity-50"></div>

          {/* Progress Section */}
          <ProgressBar currentStep={currentStep} />

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50/20 border-2 border-red-400 rounded-lg animate-shake">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {/* remove this dot */}
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
            {renderCurrentStep()}

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

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm font-medium tracking-wide">© 2025 LOANlo Financial Services. All rights reserved.</p>
          <p className="text-xs mt-2">Secure • Professional • Confidential</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;