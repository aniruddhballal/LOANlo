export interface PersonalDetailsData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  aadhaarNumber: string;
  panNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  employmentType: string;
  companyName: string;
  designation: string;
  workExperience: string;
  monthlyIncome: string;
}

export interface PersonalDetailsFormProps {
  formData: PersonalDetailsData;
  focusedField: string;
  onFieldChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onFocus: (fieldName: string) => void;
  onBlur: () => void;
}

export type StepStatus = 'completed' | 'current' | 'incomplete';

export interface StepInfo {
  title: string;
  description: string;
}