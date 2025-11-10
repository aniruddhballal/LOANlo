import React from 'react';
import type { PersonalDetailsData } from './types';

interface BaseFieldProps {
  name: keyof PersonalDetailsData;
  label: string;
  required?: boolean;
  focusedField: string;
  formData: PersonalDetailsData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onFocus: (fieldName: string) => void;
  onBlur: () => void;
}

interface InputFieldProps extends BaseFieldProps {
  type?: string;
  maxLength?: number;
  min?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
}

interface SelectFieldProps extends BaseFieldProps {
  options: { value: string; label: string }[];
}

export const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type = "text",
  required = true,
  maxLength,
  min,
  focusedField,
  formData,
  onChange,
  onFocus,
  onBlur,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Add Aadhaar & PAN restrictions automatically
  const getFieldProps = () => {
    if (name === "aadhaarNumber") {
      return {
        inputMode: "numeric" as const,
        pattern: "[0-9]{12}",
      };
    }
    if (name === "panNumber") {
      return {
        inputMode: "text" as const,
        pattern: "[A-Z]{5}[0-9]{4}[A-Z]{1}",
        style: { textTransform: "uppercase" as const },
      };
    }
    return {};
  };

  // Handler to open date picker when clicking anywhere on the container
  const handleContainerClick = () => {
    if (type === "date" && inputRef.current) {
      inputRef.current.showPicker?.();
    }
  };

  return (
    <div className="relative group">
      <label
        className={`block text-sm font-semibold text-gray-800 mb-2 tracking-wide ${
          required
            ? "after:content-['*'] after:ml-1 after:text-red-500"
            : ""
        }`}
      >
        {label}
      </label>
      <div
        className={`relative transition-all duration-300 ${
          focusedField === name ? "transform scale-[1.02]" : ""
        } ${type === "date" ? "cursor-pointer" : ""}`}
        onClick={handleContainerClick}
      >
        <input
          ref={inputRef}
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={(e) => {
            // Force uppercase for PAN
            const value =
              name === "panNumber"
                ? e.target.value.toUpperCase()
                : e.target.value;

            const newEvent = {
              ...e,
              target: { ...e.target, name: e.target.name, value },
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(newEvent);
          }}
          onFocus={() => onFocus(name)}
          onBlur={onBlur}
          className={`w-full px-4 py-3 bg-white border-2 rounded-lg font-medium text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none hover:border-gray-400 ${
            type === "number"
              ? "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              : ""
          } ${
            type === "date" ? "cursor-pointer" : ""
          } ${
            focusedField === name
              ? "border-gray-800 shadow-lg transform scale-[1.01]"
              : "border-gray-200 shadow-sm"
          }`}
          required={required}
          maxLength={maxLength}
          min={min}
          placeholder={`Enter ${label.toLowerCase()}`}
          {...getFieldProps()}
        />
        <div
          className={`absolute inset-0 rounded-lg bg-gradient-to-r from-gray-100 to-gray-50 opacity-0 pointer-events-none transition-opacity duration-300 ${
            focusedField === name ? "opacity-20" : ""
          }`}
        ></div>
      </div>
    </div>
  );
};

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  options,
  required = true,
  focusedField,
  formData,
  onChange,
  onFocus,
  onBlur
}) => (
  <div className="relative group">
    <label className={`block text-sm font-semibold text-gray-800 mb-2 tracking-wide ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}>
      {label}
    </label>
    <div className={`relative transition-all duration-300 ${focusedField === name ? 'transform scale-[1.02]' : ''}`}>
      <select
        name={name}
        value={formData[name] || ''}
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
);

export const TextareaField: React.FC<BaseFieldProps> = ({
  name,
  label,
  required = true,
  focusedField,
  formData,
  onChange,
  onFocus,
  onBlur
}) => (
  <div className="relative group">
    <label className={`block text-sm font-semibold text-gray-800 mb-2 tracking-wide ${required ? "after:content-['*'] after:ml-1 after:text-red-500" : ''}`}>
      {label}
    </label>
    <div className={`relative transition-all duration-300 ${focusedField === name ? 'transform scale-[1.02]' : ''}`}>
      <textarea
        name={name}
        value={formData[name] || ''}
        onChange={onChange}
        onFocus={() => onFocus(name)}
        onBlur={onBlur}
        rows={4}
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
);

interface CurrencyFieldProps extends BaseFieldProps {
  min?: string;
}

export const CurrencyField: React.FC<CurrencyFieldProps> = ({
  name,
  label,
  required = true,
  min,
  focusedField,
  formData,
  onChange,
  onFocus,
  onBlur
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
          value={formData[name] || ''}
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
);