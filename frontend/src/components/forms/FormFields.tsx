import React from 'react'

interface BaseFieldProps {
  name: string
  label: string
  required?: boolean
  focusedField: string
  onFocus: (fieldName: string) => void
  onBlur: () => void
}

interface SelectFieldProps extends BaseFieldProps {
  value: string
  options: { value: string; label: string }[]
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

interface TextareaFieldProps extends BaseFieldProps {
  value: string
  rows?: number
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

interface CurrencyFieldProps extends BaseFieldProps {
  value: string
  min?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  value,
  options,
  required = true,
  focusedField,
  onFocus,
  onBlur,
  onChange
}) => (
  <div className="relative group">
    <label className={`block text-sm font-semibold text-gray-800 mb-2 tracking-wide ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}>
      {label}
    </label>
    <div className={`relative transition-all duration-300 ${focusedField === name ? 'transform scale-[1.02]' : ''}`}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => onFocus(name)}
        onBlur={onBlur}
        className={`w-full px-4 py-3 pr-12 bg-white border-2 rounded-lg font-medium text-gray-800 transition-all duration-300 focus:outline-none hover:border-gray-400 cursor-pointer appearance-none ${
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

export const TextareaField: React.FC<TextareaFieldProps> = ({
  name,
  label,
  value,
  required = true,
  rows = 4,
  focusedField,
  onFocus,
  onBlur,
  onChange
}) => (
  <div className="relative group">
    <label className={`block text-sm font-semibold text-gray-800 mb-2 tracking-wide ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}>
      {label}
    </label>
    <div className={`relative transition-all duration-300 ${focusedField === name ? 'transform scale-[1.02]' : ''}`}>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => onFocus(name)}
        onBlur={onBlur}
        rows={rows}
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

export const CurrencyField: React.FC<CurrencyFieldProps> = ({
  name,
  label,
  value,
  required = true,
  min,
  focusedField,
  onFocus,
  onBlur,
  onChange
}) => (
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
          value={value}
          onChange={onChange}
          onFocus={() => onFocus(name)}
          onBlur={onBlur}
          className="flex-1 px-4 py-3 bg-transparent font-medium text-gray-800 placeholder-gray-400 focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
          required={required}
          min={min}
          placeholder="0"
        />
      </div>
    </div>
  </div>
)