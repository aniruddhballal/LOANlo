import type { KYCData, StepInfo } from './types';

export const REQUIRED_FIELDS_BY_STEP: { [key: number]: (keyof KYCData)[] } = {
  1: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus', 'aadhaarNumber', 'panNumber'],
  2: ['email', 'phone', 'address', 'city', 'state', 'pincode'],
  3: ['employmentType', 'companyName', 'designation', 'workExperience', 'monthlyIncome'],
};

export const STEP_INFO: { [key: number]: StepInfo } = {
  1: {
    title: 'Personal Information',
    description: 'Please provide your personal details as they appear on official documents'
  },
  2: {
    title: 'Contact Information',
    description: 'Provide your current contact information and residential address'
  },
  3: {
    title: 'Employment Information',
    description: 'Share your employment and income details for verification'
  }
};

export const SELECT_OPTIONS = {
  gender: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ],
  maritalStatus: [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' }
  ],
  employmentType: [
    { value: 'salaried', label: 'Salaried Employee' },
    { value: 'self_employed', label: 'Self Employed Professional' },
    { value: 'business', label: 'Business Owner' },
    { value: 'freelancer', label: 'Freelancer' }
  ]
};

export const INITIAL_KYC_DATA: KYCData = {
  // Personal Information
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  aadhaarNumber: '',
  panNumber: '',
  
  // Contact Information
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  
  // Employment Information
  employmentType: '',
  companyName: '',
  designation: '',
  workExperience: '',
  monthlyIncome: ''
};