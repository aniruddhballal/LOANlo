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
          <h2 className="text-2xl font-bold text-gray-900 tracking-wide">
            Personal Details Form
          </h2>
          <p className="text-gray-600 font-medium mt-1">
            Please complete all sections to proceed with your application
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
          const status = getStepStatus(step, currentStep);
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
          );
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
              Getting Started - Personal Details Required
            </>
          )}
          {currentStep > 1 && currentStep < 3 && (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              In Progress - {Math.round(((currentStep - 1) / 3) * 100)}% Complete
            </>
          )}
          {currentStep === 3 && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Almost Done - Final Step
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;