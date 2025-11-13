import React, { useState, useEffect } from 'react';
import { InputField, SelectField, TextareaField, CurrencyField } from './FormComponents';
import type { PersonalDetailsFormProps  } from './types';
import { SELECT_OPTIONS, STEP_INFO } from './constants';
import { validateField } from './validationRules';
import { ErrorMessage } from '../../ui/StatusMessages';

// Success message component
const SuccessMessage: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-green-600 text-sm mt-1 flex items-center">
    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
    {message}
  </p>
);

export const PersonalInfoStep: React.FC<PersonalDetailsFormProps> = ({
  formData,
  focusedField,
  onFieldChange,
  onFocus,
  onBlur
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // CHANGED: Generic handler using validateField from validationRules
  const createFieldHandler = (fieldName: string, transform?: (value: string) => string) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      let value = e.target.value;
      
      // Apply transformation if provided (e.g., toUpperCase for PAN)
      if (transform && e.target instanceof HTMLInputElement) {
        value = transform(value);
        e.target.value = value;
      }
      
      onFieldChange(e);
      
      const error = validateField(fieldName, value);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      } else {
        setErrors(prev => {
          const { [fieldName]: _, ...rest } = prev;
          return rest;
        });
      }
    };
  };

  // CHANGED: Using the generic handler
  const handleFirstNameChange = createFieldHandler('firstName');
  const handleLastNameChange = createFieldHandler('lastName');
  const handleDateOfBirthChange = createFieldHandler('dateOfBirth');
  const handleGenderChange = createFieldHandler('gender');
  const handleMaritalStatusChange = createFieldHandler('maritalStatus');
  const handleAadhaarChange = createFieldHandler('aadhaarNumber', (value) => value.replace(/\D/g, ""));
  const handlePANChange = createFieldHandler('panNumber', (value) => value.toUpperCase());

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
            onChange={handleFirstNameChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.firstName && <ErrorMessage message={errors.firstName} />}
        </div>
        <div>
          <InputField
            name="lastName"
            label="Last Name"
            focusedField={focusedField}
            formData={formData}
            onChange={handleLastNameChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.lastName && <ErrorMessage message={errors.lastName} />}
        </div>
        <div>
          <InputField
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            focusedField={focusedField}
            formData={formData}
            onChange={handleDateOfBirthChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.dateOfBirth && <ErrorMessage message={errors.dateOfBirth} />}
        </div>
        <div>
          <SelectField
            name="gender"
            label="Gender"
            options={SELECT_OPTIONS.gender}
            focusedField={focusedField}
            formData={formData}
            onChange={handleGenderChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.gender && <ErrorMessage message={errors.gender} />}
        </div>
        <div>
          <SelectField
            name="maritalStatus"
            label="Marital Status"
            options={SELECT_OPTIONS.maritalStatus}
            focusedField={focusedField}
            formData={formData}
            onChange={handleMaritalStatusChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.maritalStatus && <ErrorMessage message={errors.maritalStatus} />}
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

  useEffect(() => {
    const existingPincode = formData.pincode;
    if (existingPincode && existingPincode.length === 6 && /^\d{6}$/.test(existingPincode)) {
      // Trust that database pincode is valid, set flag without API call
      const validEvent = {
        target: { name: 'pincodeValid', value: 'true', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>;
      onFieldChange(validEvent);
    }
  }, []);

  // CHANGED: Generic handler using validateField
  const createFieldHandler = (fieldName: string) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      onFieldChange(e);
      
      const error = validateField(fieldName, value);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      } else {
        setErrors(prev => {
          const { [fieldName]: _, ...rest } = prev;
          return rest;
        });
      }
    };
  };

  const handleEmailChange = createFieldHandler('email');
  const handlePhoneChange = createFieldHandler('phone');
  const handleAddressChange = createFieldHandler('address');
  const handleCityChange = createFieldHandler('city');
  const handleStateChange = createFieldHandler('state');

  const fetchPincodeDetails = async (pincode: string) => {
    // Keep pincode validation check
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
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
                
        setTimeout(() => {
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

          const validEvent = {
            target: { 
              name: 'pincodeValid', 
              value: 'true',
              type: 'text'
            }
          } as React.ChangeEvent<HTMLInputElement>;

          onFieldChange(cityEvent);
          onFieldChange(stateEvent);
          onFieldChange(validEvent);
          
          setErrors(prev => {
            const { city, state, pincode, ...rest } = prev;
            return rest;
          });
          
          setPincodeSuccess(true);
          setTimeout(() => setPincodeSuccess(false), 3000);
        }, 0);
      } else {
        setErrors(prev => ({ 
          ...prev, 
          pincode: "Invalid pincode or no data found" 
        }));
        
        const errorEvent = {
          target: { 
            name: 'pincodeValid', 
            value: 'false',
            type: 'text'
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onFieldChange(errorEvent);
      }
    } catch (error) {
      console.error('Pincode API Error:', error);
      setErrors(prev => ({ 
        ...prev, 
        pincode: "Failed to fetch pincode details. Please try again." 
      }));
      
      const errorEvent = {
        target: { 
          name: 'pincodeValid', 
          value: 'false',
          type: 'text'
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onFieldChange(errorEvent);
    } finally {
      setPincodeLoading(false);
    }
  };

  const handlePincodeChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = (e) => {
    let value = e.target.value.replace(/\D/g, '');
        
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'pincode',
        value: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onFieldChange(syntheticEvent);

    // CHANGED: Use validateField instead of manual validation
    const error = validateField('pincode', value);
    if (error) {
      setErrors(prev => ({ ...prev, pincode: error }));
      const invalidEvent = {
        target: { name: 'pincodeValid', value: 'false', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>;
      onFieldChange(invalidEvent);
    } else {
      // CHANGED: Don't clear pincode error here - wait for API validation to succeed
      // The error will be cleared by fetchPincodeDetails when API returns success
      // setErrors(prev => { const { pincode, ...rest } = prev; return rest; });
      
      // Set as pending while waiting for API validation
      const pendingEvent = {
        target: { name: 'pincodeValid', value: 'pending', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>;
      onFieldChange(pendingEvent);
      
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
            onChange={handleAddressChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.address && <ErrorMessage message={errors.address} />}
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
              <div className="absolute right-3 top-10">
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
            onChange={handleCityChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.city && <ErrorMessage message={errors.city} />}
        </div>
        <div>
          <InputField
            name="state"
            label="State"
            focusedField={focusedField}
            formData={formData}
            onChange={handleStateChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.state && <ErrorMessage message={errors.state} />}
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
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // CHANGED: Generic handler using validateField
  const createFieldHandler = (fieldName: string) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      onFieldChange(e);
      
      const error = validateField(fieldName, value);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      } else {
        setErrors(prev => {
          const { [fieldName]: _, ...rest } = prev;
          return rest;
        });
      }
    };
  };

  const handleEmploymentTypeChange = createFieldHandler('employmentType');
  const handleCompanyNameChange = createFieldHandler('companyName');
  const handleDesignationChange = createFieldHandler('designation');
  const handleWorkExperienceChange = createFieldHandler('workExperience');
  const handleMonthlyIncomeChange = createFieldHandler('monthlyIncome');

  return (
    <div className="space-y-8">
      <div className="text-center border-b pb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">{STEP_INFO[3].title}</h3>
        <p className="text-gray-600 font-medium">{STEP_INFO[3].description}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <SelectField
            name="employmentType"
            label="Employment Type"
            options={SELECT_OPTIONS.employmentType}
            focusedField={focusedField}
            formData={formData}
            onChange={handleEmploymentTypeChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.employmentType && <ErrorMessage message={errors.employmentType} />}
        </div>
        <div>
          <InputField
            name="companyName"
            label="Company/Organization Name"
            focusedField={focusedField}
            formData={formData}
            onChange={handleCompanyNameChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.companyName && <ErrorMessage message={errors.companyName} />}
        </div>
        <div>
          <InputField
            name="designation"
            label="Job Title/Designation"
            focusedField={focusedField}
            formData={formData}
            onChange={handleDesignationChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.designation && <ErrorMessage message={errors.designation} />}
        </div>
        <div>
          <InputField
            name="workExperience"
            label="Work Experience (Years)"
            type="number"
            min="0"
            focusedField={focusedField}
            formData={formData}
            onChange={handleWorkExperienceChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.workExperience && <ErrorMessage message={errors.workExperience} />}
        </div>
        <div className="lg:col-span-2">
          <CurrencyField
            name="monthlyIncome"
            label="Monthly Income"
            min="0"
            focusedField={focusedField}
            formData={formData}
            onChange={handleMonthlyIncomeChange}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {errors.monthlyIncome && <ErrorMessage message={errors.monthlyIncome} />}
        </div>
      </div>
    </div>
  );
};

// CHANGED: Export validation function that uses VALIDATION_RULES
export const validateStep = (
  step: number,
  formData: any,
  requiredFieldsByStep: { [key: number]: (keyof any)[] }
): boolean => {
  const requiredFields = requiredFieldsByStep[step] || [];
  
  const fieldsValid = requiredFields.every((field) => {
    const value = formData[field];
    
    // Must have a value
    if (value === null || value === undefined || value.toString().trim() === '') {
      return false;
    }
    
    // Must pass validation rule
    const error = validateField(field as string, value);
    return error === null;
  });

  // SPECIAL CASE: For step 2 (Contact Info), also check if pincode API validation succeeded
  if (step === 2) {
    return fieldsValid && formData.pincodeValid === 'true';
  }

  return fieldsValid;
};