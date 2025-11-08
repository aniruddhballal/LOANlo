import React from 'react';
import { InputField, SelectField, TextareaField, CurrencyField } from './FormComponents';
import type { PersonalDetailsFormProps  } from './types';
import { SELECT_OPTIONS, STEP_INFO } from './constants';
import { useState } from 'react';

// Validation functions
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPAN = (pan: string) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

const isValidAadhaar = (aadhaar: string) => {
  return aadhaar.length === 12 && /^\d{12}$/.test(aadhaar);
};

const isValidPhone = (phone: string) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const isValidPincode = (pincode: string) => {
  return pincode.length === 6 && /^\d{6}$/.test(pincode);
};

// Error message component with consistent styling matching LoanForm
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-red-600 text-sm mt-1 flex items-center">
    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    {message}
  </p>
);

// Success message component
const SuccessMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="mt-2 p-3 bg-green-50/30 border border-green-200 rounded-lg">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-2">
        <p className="text-sm font-light text-green-700">{message}</p>
      </div>
    </div>
  </div>
);

export const PersonalInfoStep: React.FC<PersonalDetailsFormProps> = ({
  formData,
  focusedField,
  onFieldChange,
  onFocus,
  onBlur
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAadhaarChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = (e) => {
    let value = '';
    if (e.target instanceof HTMLInputElement) {
      value = e.target.value.replace(/\D/g, "");
      e.target.value = value;
    }
    onFieldChange(e);

    if (value && !isValidAadhaar(value)) {
      setErrors(prev => ({ ...prev, aadhaarNumber: "Aadhaar number must be 12 digits" }));
    } else {
      setErrors(prev => {
        const { aadhaarNumber, ...rest } = prev;
        return rest;
      });
    }
  };

  const handlePANChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = (e) => {
    let value = '';
    if (e.target instanceof HTMLInputElement) {
      value = e.target.value.toUpperCase();
      e.target.value = value;
    }
    onFieldChange(e);

    if (value && !isValidPAN(value)) {
      setErrors(prev => ({ ...prev, panNumber: "PAN must be in format: ABCDE1234F" }));
    } else {
      setErrors(prev => {
        const { panNumber, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center border-b pb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">{STEP_INFO[1].title}</h3>
        <p className="text-gray-600 font-medium">{STEP_INFO[1].description}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <InputField
            name="firstName"
            label="First Name"
            focusedField={focusedField}
            formData={formData}
            onChange={onFieldChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        <div>
          <InputField
            name="lastName"
            label="Last Name"
            focusedField={focusedField}
            formData={formData}
            onChange={onFieldChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        <div>
          <InputField
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            focusedField={focusedField}
            formData={formData}
            onChange={onFieldChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {formData.dateOfBirth && (() => {
            const dob = new Date(formData.dateOfBirth);
            if (isNaN(dob.getTime())) return null;
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
            return age < 18 ? <ErrorMessage message="You must be at least 18 years old to apply" /> : null;
          })()}
        </div>
        <div>
          <SelectField
            name="gender"
            label="Gender"
            options={SELECT_OPTIONS.gender}
            focusedField={focusedField}
            formData={formData}
            onChange={onFieldChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        <div>
          <SelectField
            name="maritalStatus"
            label="Marital Status"
            options={SELECT_OPTIONS.maritalStatus}
            focusedField={focusedField}
            formData={formData}
            onChange={onFieldChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        <div className="lg:col-span-2">
          <InputField
            name="aadhaarNumber"
            label="Aadhaar Number"
            maxLength={12}
            inputMode="numeric"
            pattern="[0-9]*"
            focusedField={focusedField}
            formData={formData}
            onChange={handleAadhaarChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.aadhaarNumber && <ErrorMessage message={errors.aadhaarNumber} />}
          {!errors.aadhaarNumber && formData.aadhaarNumber && formData.aadhaarNumber.length > 0 && formData.aadhaarNumber.length < 12 && (
            <ErrorMessage message="Aadhaar number must be exactly 12 digits" />
          )}
        </div>
        <div className="lg:col-span-2">
          <InputField
            name="panNumber"
            label="PAN Number"
            maxLength={10}
            focusedField={focusedField}
            formData={formData}
            onChange={handlePANChange}
            onFocus={onFocus}
            onBlur={onBlur}
            inputMode="text"
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
          />
          {(errors.panNumber || (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.panNumber))) && (
            <ErrorMessage message="PAN must be 10 characters in format: ABCDE1234F" />
          )}
        </div>
      </div>
    </div>
  );
};

// Define interface before the component
interface PincodeApiResponse {
  Status: string;
  Message: string;
  PostOffice?: Array<{
    Name: string;
    District: string;
    State: string;
  }>;
}

export const ContactInfoStep: React.FC<PersonalDetailsFormProps> = ({
  formData,
  focusedField,
  onFieldChange,
  onFocus,
  onBlur
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  const handleEmailChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = (e) => {
    let value = '';
    if (e.target instanceof HTMLInputElement) {
      value = e.target.value;
    }
    onFieldChange(e);

    if (value && !isValidEmail(value)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
    } else {
      setErrors(prev => {
        const { email, ...rest } = prev;
        return rest;
      });
    }
  };

  const handlePhoneChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = (e) => {
    let value = '';
    if (e.target instanceof HTMLInputElement) {
      value = e.target.value;
    }
    onFieldChange(e);

    if (value && !isValidPhone(value)) {
      setErrors(prev => ({ ...prev, phone: "Phone number must be 10 digits starting with 6-9" }));
    } else {
      setErrors(prev => {
        const { phone, ...rest } = prev;
        return rest;
      });
    }
  };

  const fetchPincodeDetails = async (pincode: string) => {
    if (!isValidPincode(pincode)) {
      return;
    }

    setPincodeLoading(true);
    setPincodeSuccess(false);
    setErrors(prev => {
      const { pincode: _, ...rest } = prev;
      return rest;
    });

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data: PincodeApiResponse[] = await response.json();

      if (data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
                
        // Use setTimeout to batch updates and prevent pincode field interference
        setTimeout(() => {
          // Create synthetic events to trigger the form update
          const cityEvent = {
            target: { 
              name: 'city', 
              value: postOffice.District,
              type: 'text'
            }
          } as React.ChangeEvent<HTMLInputElement>;
          
          const stateEvent = {
            target: { 
              name: 'state', 
              value: postOffice.State,
              type: 'text'
            }
          } as React.ChangeEvent<HTMLInputElement>;

          // Call onFieldChange for both fields
          onFieldChange(cityEvent);
          onFieldChange(stateEvent);
          
          setPincodeSuccess(true);
          setTimeout(() => setPincodeSuccess(false), 3000);
        }, 0);
      } else {
        setErrors(prev => ({ 
          ...prev, 
          pincode: "Invalid pincode or no data found" 
        }));
      }
    } catch (error) {
      console.error('Pincode API Error:', error); // Debug log
      setErrors(prev => ({ 
        ...prev, 
        pincode: "Failed to fetch pincode details. Please try again." 
      }));
    } finally {
      setPincodeLoading(false);
    }
  };

  const handlePincodeChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = (e) => {
    let value = e.target.value.replace(/\D/g, '');
        
    // Create a new event with the cleaned value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'pincode',
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onFieldChange(syntheticEvent);

    if (value && !isValidPincode(value)) {
      setErrors(prev => ({ ...prev, pincode: "Pincode must be 6 digits" }));
    } else {
      setErrors(prev => {
        const { pincode, ...rest } = prev;
        return rest;
      });
      
      // Fetch pincode details when valid
      if (value.length === 6) {
        fetchPincodeDetails(value);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center border-b pb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">
          {STEP_INFO[2].title}
        </h3>
        <p className="text-gray-600 font-medium">{STEP_INFO[2].description}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <InputField
            name="email"
            label="Email Address (e.g., example@email.com)"
            type="email"
            focusedField={focusedField}
            formData={formData}
            onChange={handleEmailChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.email && <ErrorMessage message={errors.email} />}
        </div>
        <div>
          <InputField
            name="phone"
            label="Phone Number (10 digits, starting with 6-9)"
            type="tel"
            maxLength={10}
            focusedField={focusedField}
            formData={formData}
            onChange={handlePhoneChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.phone && <ErrorMessage message={errors.phone} />}
        </div>
        <div className="lg:col-span-2">
          <TextareaField
            name="address"
            label="Residential Address"
            focusedField={focusedField}
            formData={formData}
            onChange={onFieldChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="relative">
            <InputField
              name="pincode"
              label="Pincode (6 digits)"
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              focusedField={focusedField}
              formData={formData}
              onChange={handlePincodeChange}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {pincodeLoading && (
              <div className="absolute right-3 top-9">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {errors.pincode && <ErrorMessage message={errors.pincode} />}
          {pincodeSuccess && <SuccessMessage message="City and State auto-filled successfully!" />}
        </div>
        <div>
          <InputField
            name="city"
            label="City"
            focusedField={focusedField}
            formData={formData}
            onChange={onFieldChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        <div>
          <InputField
            name="state"
            label="State"
            focusedField={focusedField}
            formData={formData}
            onChange={onFieldChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      </div>
    </div>
  );
};

export const EmploymentInfoStep: React.FC<PersonalDetailsFormProps> = ({
  formData,
  focusedField,
  onFieldChange,
  onFocus,
  onBlur
}) => (
  <div className="space-y-8">
    <div className="text-center border-b pb-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">{STEP_INFO[3].title}</h3>
      <p className="text-gray-600 font-medium">{STEP_INFO[3].description}</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <SelectField
        name="employmentType"
        label="Employment Type"
        options={SELECT_OPTIONS.employmentType}
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <InputField
        name="companyName"
        label="Company/Organization Name"
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <InputField
        name="designation"
        label="Job Title/Designation"
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <InputField
        name="workExperience"
        label="Work Experience (Years)"
        type="number"
        min="0"
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <div className="lg:col-span-2">
        <CurrencyField
          name="monthlyIncome"
          label="Monthly Income"
          min="0"
          focusedField={focusedField}
          formData={formData}
          onChange={onFieldChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    </div>
  </div>
);

// Export validation functions for use in parent component
export const validateStep = (
  step: number,
  formData: any,
  requiredFieldsByStep: { [key: number]: (keyof any)[] }
): boolean => {
  // 1. Required fields check
  const requiredFieldsValid = requiredFieldsByStep[step]?.every((field) => {
    const value = formData[field];
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }) || false;

  if (!requiredFieldsValid) return false;

  // 2. Step-specific validations
  switch (step) {
    case 1:
      // Personal info + ID validations
      return (
        formData.firstName?.trim() &&
        formData.lastName?.trim() &&
        formData.dateOfBirth?.trim() &&
        formData.gender?.trim() &&
        formData.maritalStatus?.trim() &&
        // Age check: 18+
        (() => {
          const dob = new Date(formData.dateOfBirth);
          if (isNaN(dob.getTime())) return false;
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
          return age >= 18;
        })() &&
        // Aadhaar & PAN
        /^\d{12}$/.test(formData.aadhaarNumber || '') &&
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber || '')
      );

    case 2:
      // Contact + address validations
      return (
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || '') &&
        /^[6-9]\d{9}$/.test(formData.phone || '') &&
        formData.address?.trim() &&
        formData.city?.trim() &&
        formData.state?.trim() &&
        /^\d{6}$/.test(formData.pincode || '')
      );

    case 3:
      // Employment + numeric validations
      const workExp = Number(formData.workExperience);
      const monthlyIncome = Number(formData.monthlyIncome);
      return (
        formData.employmentType?.trim() &&
        formData.companyName?.trim() &&
        formData.designation?.trim() &&
        !isNaN(workExp) &&
        workExp >= 0 &&
        !isNaN(monthlyIncome) &&
        monthlyIncome >= 1000 && monthlyIncome <= 10000000
      );

    default:
      return false;
  }
};