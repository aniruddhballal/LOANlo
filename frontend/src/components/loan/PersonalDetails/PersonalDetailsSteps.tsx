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

// Error message component with consistent styling
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="mt-2 p-3 bg-red-50/30 border border-red-200 rounded-lg">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-2">
        <p className="text-sm font-light text-red-700">{message}</p>
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
    const target = e.target as HTMLInputElement; // safe, since this is Aadhaar input
    const value = target.value.replace(/\D/g, "");
    target.value = value;
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
    const target = e.target as HTMLInputElement; // safe, this is an <input>
    const value = target.value.toUpperCase();
    target.value = value;
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
          {errors.panNumber && <ErrorMessage message={errors.panNumber} />}
        </div>
      </div>
    </div>
  );
};

export const ContactInfoStep: React.FC<PersonalDetailsFormProps> = ({
  formData,
  focusedField,
  onFieldChange,
  onFocus,
  onBlur
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEmailChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = (e) => {
    const target = e.target as HTMLInputElement;
    const { value } = target;
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

  const handlePhoneChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = (e) => {
    const target = e.target as HTMLInputElement;
    const { value } = target;
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

  const handlePincodeChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = (e) => {
    const target = e.target as HTMLInputElement;
    const { value } = target;
    onFieldChange(e);

    if (value && !isValidPincode(value)) {
      setErrors(prev => ({ ...prev, pincode: "Pincode must be 6 digits" }));
    } else {
      setErrors(prev => {
        const { pincode, ...rest } = prev;
        return rest;
      });
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
            label="Email Address"
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
            label="Phone Number"
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
        <div>
          <InputField
            name="pincode"
            label="Pincode"
            maxLength={6}
            focusedField={focusedField}
            formData={formData}
            onChange={handlePincodeChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.pincode && <ErrorMessage message={errors.pincode} />}
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
export const validateStep = (step: number, formData: any, requiredFieldsByStep: { [key: number]: (keyof any)[] }): boolean => {
  // First check if all required fields are filled
  const requiredFieldsValid = requiredFieldsByStep[step]?.every((field) => {
    const value = formData[field]?.toString().trim();
    return value !== '' && value !== undefined && value !== null;
  }) || false;

  if (!requiredFieldsValid) return false;

  // Then apply additional format/business rule validations
  switch (step) {
    case 1:
      return (
        formData.firstName?.trim() &&
        formData.lastName?.trim() &&
        formData.dateOfBirth?.trim() &&
        formData.gender?.trim() &&
        formData.maritalStatus?.trim() &&
        isValidAadhaar(formData.aadhaarNumber || '') &&
        isValidPAN(formData.panNumber || '')
      );
    case 2:
      return (
        isValidEmail(formData.email || '') &&
        isValidPhone(formData.phone || '') &&
        formData.address?.trim() &&
        formData.city?.trim() &&
        formData.state?.trim() &&
        isValidPincode(formData.pincode || '')
      );
    case 3:
      return (
        formData.employmentType?.trim() &&
        formData.companyName?.trim() &&
        formData.designation?.trim() &&
        formData.workExperience !== null &&
        formData.workExperience !== undefined &&
        formData.workExperience !== '' &&
        formData.workExperience.toString().trim() !== '' &&
        Number(formData.workExperience) >= 0 &&
        formData.monthlyIncome !== null &&
        formData.monthlyIncome !== undefined &&
        formData.monthlyIncome !== '' &&
        formData.monthlyIncome.toString().trim() !== '' &&
        Number(formData.monthlyIncome) > 0
      );
    default:
      return false;
  }
};