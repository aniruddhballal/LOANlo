export interface UserProfile {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  employmentType?: string;
  companyName?: string;
  designation?: string;
  workExperience?: number | string | undefined;
  monthlyIncome?: number | string | undefined;
  // add more fields if backend expects them
}

const REQUIRED_FIELDS: (keyof UserProfile)[] = [
  'firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus',
  'aadhaarNumber', 'panNumber', 'email', 'phone', 'address', 'city',
  'state', 'pincode', 'employmentType', 'companyName', 'designation',
  'workExperience', 'monthlyIncome'
];

export function isProfileComplete(user: UserProfile): boolean {
  if (!user) return false;

  // 1. Required fields check
  const allFieldsPresent = REQUIRED_FIELDS.every(field => {
    const value = user[field];
    if (value === null || value === undefined) return false;
    return value.toString().trim() !== '';
  });

  if (!allFieldsPresent) return false;

  // 2. Regex checks
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email || '');
  const phoneValid = /^[6-9]\d{9}$/.test(user.phone || '');
  const pincodeValid = /^\d{6}$/.test(user.pincode || '');
  const aadhaarValid = /^\d{12}$/.test(user.aadhaarNumber || '');
  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(user.panNumber || '');

  if (!(emailValid && phoneValid && pincodeValid && aadhaarValid && panValid)) {
    return false;
  }

  // 3. Work experience & income checks
  const workExp = Number(user.workExperience);
  const monthlyIncome = Number(user.monthlyIncome);

  if (isNaN(workExp) || workExp < 0) return false;
  if (isNaN(monthlyIncome) || monthlyIncome <= 0) return false;

  return true;
}