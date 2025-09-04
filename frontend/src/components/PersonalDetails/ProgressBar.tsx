import React from 'react';
import type { StepStatus } from './types';

interface ProgressBarProps {
  currentStep: number;
}

const getStepStatus = (step: number, currentStep: number): StepStatus => {
  if (step < currentStep) return 'completed';
  if (step === currentStep) return 'current';
  return 'incomplete';
};

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <div className="mb-12 relative z-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-light text-slate-900 tracking-tight">
            Personal Details Form
          </h2>
          <p className="text-slate-500 font-normal mt-2 leading-relaxed">
            Please complete all sections to proceed with your application
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-light text-slate-800">{currentStep}</div>
          <div className="text-sm text-slate-400 font-medium tracking-wider">OF 3 STEPS</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative mb-8">
        {/* Background track */}
        <div className="h-1 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 rounded-full shadow-inner overflow-hidden">
          {/* Completed sections */}
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-lg"         
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 blur-sm opacity-50"></div>
          </div>
          
          {/* Current section indicator */}
          {currentStep <= 3 && (
            <div 
              className="absolute top-0 h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 ease-in-out"
              style={{ 
                left: `${((currentStep - 1) / 3) * 100}%`,
                width: `${100 / 3}%`,
                opacity: 0.6
              }}
            />
          )}
          
          {/* Subtle shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
      </div>

      {/* Refined Step Indicators */}
      <div className="flex justify-between items-center mb-8">
        {[1, 2, 3].map((step) => {
          const status = getStepStatus(step, currentStep);
          return (
            <div key={step} className="flex flex-col items-center space-y-3">
              <div className={`relative w-14 h-14 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-500 shadow-lg ${
                status === 'completed'
                  ? 'bg-emerald-500 text-white shadow-emerald-200 border-2 border-emerald-600' 
                  : status === 'current'
                    ? 'bg-white text-slate-700 shadow-slate-200 border-2 border-amber-400 transform scale-105'
                    : 'bg-white text-slate-400 shadow-slate-100 border-2 border-slate-200'
              }`}>
                {status === 'completed' ? (
                  <svg className="w-7 h-7 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="font-semibold text-base">{step}</span>
                )}
                
                {/* Current step glow effect */}
                {status === 'current' && (
                  <div className="absolute -inset-1 bg-amber-400 rounded-full opacity-20 animate-pulse"></div>
                )}
              </div>
              
              <div className="text-center">
                <span className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
                  status === 'completed' ? 'text-emerald-600' 
                  : status === 'current' ? 'text-amber-600' 
                  : 'text-slate-400'
                }`}>
                  {step === 1 ? 'PERSONAL' : step === 2 ? 'CONTACT' : 'EMPLOYMENT'}
                </span>
                
                {/* Refined status dot */}
                <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-2 transition-all duration-300 ${
                  status === 'completed' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' 
                  : status === 'current' ? 'bg-amber-400 shadow-lg shadow-amber-200 animate-pulse' 
                  : 'bg-slate-300'
                }`}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Progress Status */}
      <div className="text-center">
        <div className={`inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg backdrop-blur-sm ${
          currentStep === 1 ? 'bg-slate-50/80 text-slate-700 border border-slate-200/80' 
          : currentStep < 3 ? 'bg-amber-50/80 text-amber-700 border border-amber-200/80'
          : 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/80'
        }`}>
          {currentStep === 1 && (
            <>
              <div className="w-2 h-2 bg-slate-500 rounded-full mr-3 animate-pulse"></div>
              Getting Started - Personal Details Required
            </>
          )}
          {currentStep > 1 && currentStep < 3 && (
            <>
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
              In Progress - {Math.round(((currentStep - 1) / 3) * 100)}% Complete
            </>
          )}
          {currentStep === 3 && (
            <>
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
              Almost Done - Final Step
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;