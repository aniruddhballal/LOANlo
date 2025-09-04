import React from 'react';
import { InputField, SelectField, TextareaField, CurrencyField } from './FormComponents';
import type { PersonalDetailsFormProps  } from './types';
import { SELECT_OPTIONS, STEP_INFO } from './constants';

export const PersonalInfoStep: React.FC<PersonalDetailsFormProps> = ({
  formData,
  focusedField,
  onFieldChange,
  onFocus,
  onBlur
}) => (
  <div className="space-y-8">
    <div className="text-center border-b pb-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">{STEP_INFO[1].title}</h3>
      <p className="text-gray-600 font-medium">{STEP_INFO[1].description}</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <InputField
        name="firstName"
        label="First Name"
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <InputField
        name="lastName"
        label="Last Name"
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
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
      <div className="lg:col-span-2">
        <InputField
          name="aadhaarNumber"
          label="Aadhaar Number"
          maxLength={12}
          inputMode="numeric"
          pattern="[0-9]*"
          focusedField={focusedField}
          formData={formData}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, ""); // strip non-digits
            onFieldChange(e);
          }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
      <div className="lg:col-span-2">
        <InputField
          name="panNumber"
          label="PAN Number"
          maxLength={10}
          focusedField={focusedField}
          formData={formData}
          onChange={onFieldChange}
          onFocus={onFocus}
          onBlur={onBlur}
          inputMode="text"
          pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
        />
      </div>
    </div>
  </div>
);

export const ContactInfoStep: React.FC<PersonalDetailsFormProps> = ({
  formData,
  focusedField,
  onFieldChange,
  onFocus,
  onBlur
}) => (
  <div className="space-y-8">
    <div className="text-center border-b pb-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-wide">{STEP_INFO[2].title}</h3>
      <p className="text-gray-600 font-medium">{STEP_INFO[2].description}</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <InputField
        name="email"
        label="Email Address"
        type="email"
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <InputField
        name="phone"
        label="Phone Number"
        type="tel"
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
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
      <InputField
        name="city"
        label="City"
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <InputField
        name="state"
        label="State"
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <InputField
        name="pincode"
        label="Pincode"
        maxLength={6}
        focusedField={focusedField}
        formData={formData}
        onChange={onFieldChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  </div>
);

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