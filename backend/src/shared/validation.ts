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

// Helper: Calculate age from date of birth
const isValidAge = (dateOfBirth: string): boolean => {
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18;
};

export function isProfileComplete(user: UserProfile): boolean {
  if (!user) return false;

  // 1. Required fields check with trimming
  const allFieldsPresent = REQUIRED_FIELDS.every(field => {
    const value = user[field];
    if (value === null || value === undefined) return false;
    return value.toString().trim() !== '';
  });
  if (!allFieldsPresent) return false;

  // Trim string fields for consistent validation
  const firstName = (user.firstName || '').trim();
  const lastName = (user.lastName || '').trim();
  const email = (user.email || '').trim();
  const phone = (user.phone || '').trim();
  const address = (user.address || '').trim();
  const pincode = (user.pincode || '').trim();
  const aadhaarNumber = (user.aadhaarNumber || '').trim();
  const panNumber = (user.panNumber || '').trim();
  const companyName = (user.companyName || '').trim();
  const designation = (user.designation || '').trim();

  // 2. Min-length checks for names, address, and company fields
  if (firstName.length < 2) return false;
  if (lastName.length < 2) return false;
  if (address.length < 10) return false;
  if (companyName.length < 1) return false; // At least 1 character
  if (designation.length < 1) return false; // At least 1 character

  // 3. Age check (must be >= 18)
  if (!user.dateOfBirth || !isValidAge(user.dateOfBirth)) {
    return false;
  }

  // 4. Regex checks with trimmed values
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid = /^[6-9]\d{9}$/.test(phone);
  const pincodeValid = /^\d{6}$/.test(pincode);
  const aadhaarValid = /^\d{12}$/.test(aadhaarNumber);
  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber);

  if (!(emailValid && phoneValid && pincodeValid && aadhaarValid && panValid)) {
    return false;
  }

  // 5. Work experience check
  const workExp = Number(user.workExperience);
  if (isNaN(workExp) || workExp < 0) return false;

  // 6. Income range check (1000 to 10000000)
  const monthlyIncome = Number(user.monthlyIncome);
  if (isNaN(monthlyIncome) || monthlyIncome < 1000 || monthlyIncome > 10000000) {
    return false;
  }

  return true;
}