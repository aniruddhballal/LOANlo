import React from 'react'
import { SelectField, TextareaField, CurrencyField } from './forms/FormFields'

interface LoanData {
  loanType: string
  amount: string
  purpose: string
  tenure: string
}

interface LoanFormProps {
  loanData: LoanData
  focusedField: string
  loading: boolean
  isFormValid: boolean
  onFocus: (fieldName: string) => void
  onBlur: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

const loanTypeOptions = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'home', label: 'Home Loan' },
  { value: 'vehicle', label: 'Vehicle Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'education', label: 'Education Loan' }
]

const tenureOptions = [
  { value: '6', label: '6 Months' },
  { value: '12', label: '12 Months' },
  { value: '24', label: '24 Months' },
  { value: '36', label: '36 Months' },
  { value: '48', label: '48 Months' },
  { value: '60', label: '60 Months' },
  { value: '84', label: '84 Months' },
  { value: '120', label: '120 Months' }
]

export const LoanForm: React.FC<LoanFormProps> = ({
  loanData,
  focusedField,
  loading,
  isFormValid,
  onFocus,
  onBlur,
  onChange,
  onSubmit
}) => (
  <form onSubmit={onSubmit} className="relative z-10">
    <div className="space-y-8">
      <div className="text-center border-b pb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">Loan Information</h3>
        <p className="text-gray-600 font-medium">Specify your loan requirements and intended purpose</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SelectField
          name="loanType"
          label="Loan Type"
          value={loanData.loanType}
          options={loanTypeOptions}
          focusedField={focusedField}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
        />
        
        <CurrencyField
          name="amount"
          label="Loan Amount Required"
          value={loanData.amount}
          min="1000"
          focusedField={focusedField}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
        />
        
        <SelectField
          name="tenure"
          label="Repayment Tenure"
          value={loanData.tenure}
          options={tenureOptions}
          focusedField={focusedField}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
        />
        
        <div className="lg:col-span-2">
          <TextareaField
            name="purpose"
            label="Purpose of Loan"
            value={loanData.purpose}
            focusedField={focusedField}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
          />
        </div>
      </div>
    </div>

    {/* Submit Button */}
    <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
      <button 
        type="submit" 
        disabled={loading || !isFormValid}
        className={`inline-flex items-center px-12 py-4 rounded-xl font-bold tracking-wide focus:outline-none focus:ring-4 transition-all duration-200 transform shadow-xl relative overflow-hidden ${
        loading || !isFormValid
          ? 'bg-gray-50/30 border-2 border-gray-400 text-gray-600 cursor-not-allowed'
          : 'bg-green-50 border-2 border-green-700 text-green-800 hover:bg-green-100 hover:border-green-800 hover:scale-105 focus:ring-4 focus:ring-green-200'
        }`}
      >
        {loading && (
          <div className="absolute inset-0 bg-yellow-400/30 animate-pulse"></div>
        )}
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>SUBMITTING APPLICATION...</span>
          </>
        ) : (
          <>
            <span>SUBMIT LOAN APPLICATION</span>
            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isFormValid && (
              <div className="absolute inset-0 bg-white/10 animate-ping rounded-xl"></div>
            )}
          </>
        )}
      </button>
    </div>
  </form>
)