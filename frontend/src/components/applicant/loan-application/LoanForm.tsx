import React, { useState, useEffect } from 'react'
import { SelectField, TextareaField, CurrencyField } from './forms/FormFields'
import api from '../../../api'

interface LoanType {
  _id: string
  name: string
  title: string
  catchyPhrase: string
  features: string[]
  interestRateMin: number
  interestRateMax: number
  maxAmount: number
  maxTenure: number
  isActive: boolean
}

interface LoanData {
  loanType: string
  amount: string
  purpose: string
  tenure: string
}

interface ValidationErrors {
  amount?: string
  tenure?: string
  purpose?: string
}

interface LoanFormProps {
  loanTypeId: string
  loanData: LoanData
  focusedField: string
  loading: boolean
  isFormValid: boolean
  validationErrors: ValidationErrors
  selectedLoanType: LoanType | null
  onFocus: (fieldName: string) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  onChangeLoanType: () => void
}

export const LoanForm: React.FC<LoanFormProps> = ({
  loanTypeId,
  loanData,
  focusedField,
  loading,
  isFormValid,
  validationErrors,
  selectedLoanType,
  onFocus,
  onBlur,
  onChange,
  onSubmit,
  onChangeLoanType
}) => {
  const [loanType, setLoanType] = useState<LoanType | null>(selectedLoanType)
  const [loadingLoanType, setLoadingLoanType] = useState(false)
  const [error, setError] = useState('')

  // Sync with selectedLoanType prop
  useEffect(() => {
    if (selectedLoanType) {
      setLoanType(selectedLoanType)
    }
  }, [selectedLoanType])

  // Fetch loan type details when loanTypeId changes
  useEffect(() => {
    if (!loanTypeId || selectedLoanType) return

    const fetchLoanType = async () => {
      try {
        setLoadingLoanType(true)
        setError('')
        const response = await api.get(`/loan-types/${loanTypeId}`)
        const loanTypeData = response.data.loanType || response.data
        setLoanType(loanTypeData)
      } catch (err) {
        console.error('Error fetching loan type:', err)
        setError('Failed to load loan type details')
      } finally {
        setLoadingLoanType(false)
      }
    }

    fetchLoanType()
  }, [loanTypeId, selectedLoanType])

  // Generate tenure options based on maxTenure
  const generateTenureOptions = () => {
    if (!loanType) return []
    
    const maxTenureMonths = loanType.maxTenure * 12
    const options = []
    
    // Add common tenure options up to max
    const commonTenures = [6, 12, 24, 36, 48, 60, 84, 120, 180, 240, 300, 360]
    
    for (const months of commonTenures) {
      if (months <= maxTenureMonths) {
        const years = months / 12
        const label = years < 1 
          ? `${months} Months` 
          : years === 1 
            ? '1 Year' 
            : `${years} Years`
        options.push({ value: months.toString(), label })
      }
    }
    
    return options
  }

  const tenureOptions = generateTenureOptions()

  if (loadingLoanType) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    )
  }

  const interestRange = loanType 
    ? `${loanType.interestRateMin}% - ${loanType.interestRateMax}%` 
    : ''

  return (
    <form onSubmit={onSubmit} className="relative z-10">
      <div className="space-y-8">
        <div className="text-center border-b pb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">Loan Information</h3>
          <p className="text-gray-600 font-medium">Specify your loan requirements and intended purpose</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800">
                {loanType?.title || '—'}
              </div>
              <button
                type="button"
                onClick={onChangeLoanType}
                className="px-4 py-3 text-sm text-gray-600 hover:text-gray-900 underline font-light whitespace-nowrap"
              >
                Change
              </button>
            </div>
            {interestRange && (
              <p className="text-sm text-gray-500 mt-1">
                Interest Rate: {interestRange}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount Required
              {loanType?.maxAmount && (
                <span className="text-gray-500 font-normal ml-2">
                  (Max: ₹{loanType.maxAmount.toLocaleString('en-IN')})
                </span>
              )}
            </label>
            <CurrencyField
              name="amount"
              value={loanData.amount}
              min="10000"
              max={loanType?.maxAmount?.toString()}
              focusedField={focusedField}
              onFocus={onFocus}
              onBlur={onBlur}
              onChange={onChange}
              onKeyDown={(e) => {
                // Allow digits, backspace, delete, arrows, tab
                if (
                  !/[0-9]/.test(e.key) &&
                  e.key !== 'Backspace' &&
                  e.key !== 'Delete' &&
                  e.key !== 'ArrowLeft' &&
                  e.key !== 'ArrowRight' &&
                  e.key !== 'Tab'
                ) {
                  e.preventDefault()
                }
              }}
            />
            {validationErrors.amount && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.amount}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Minimum: ₹10,000</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repayment Tenure
              {loanType?.maxTenure && (
                <span className="text-gray-500 font-normal ml-2">
                  (Max: {loanType.maxTenure} {loanType.maxTenure === 1 ? 'year' : 'years'})
                </span>
              )}
            </label>
            <SelectField
              name="tenure"
              value={loanData.tenure}
              options={tenureOptions}
              focusedField={focusedField}
              onFocus={onFocus}
              onBlur={onBlur}
              onChange={onChange}
            />
            {validationErrors.tenure && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.tenure}
              </p>
            )}
          </div>
          
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Loan
              <span className="text-gray-500 font-normal ml-2">
                (10-500 characters)
              </span>
            </label>
            <TextareaField
              name="purpose"
              value={loanData.purpose}
              focusedField={focusedField}
              onFocus={onFocus}
              onBlur={onBlur}
              onChange={onChange}
              maxLength={500}
            />
            {validationErrors.purpose && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {validationErrors.purpose}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {loanData.purpose.length}/500 characters
            </p>
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
}