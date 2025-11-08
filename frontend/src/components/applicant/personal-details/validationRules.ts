// Re-use your existing validation helper functions
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

const isValidAge = (dateOfBirth: string) => {
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age >= 18;
};

// Validation rules that return error message or null
export const VALIDATION_RULES: Record<string, (value: any) => string | null> = {
  // Personal Info
  firstName: (value: string) => {
    if (!value?.trim()) return "First name is required";
    if (value.trim().length < 2) return "First name must be at least 2 characters";
    return null;
  },
  
  lastName: (value: string) => {
    if (!value?.trim()) return "Last name is required";
    if (value.trim().length < 2) return "Last name must be at least 2 characters";
    return null;
  },
  
  dateOfBirth: (value: string) => {
    if (!value) return "Date of birth is required";
    const dob = new Date(value);
    if (isNaN(dob.getTime())) return "Please enter a valid date";
    if (!isValidAge(value)) return "You must be at least 18 years old to apply";
    return null;
  },
  
  gender: (value: string) => {
    if (!value) return "Please select your gender";
    return null;
  },
  
  maritalStatus: (value: string) => {
    if (!value) return "Please select your marital status";
    return null;
  },
  
  aadhaarNumber: (value: string) => {
    if (value && !isValidAadhaar(value)) return "Aadhaar number must be 12 digits";
    return null;
    
  },
  
  panNumber: (value: string) => {
    if (value && !isValidPAN(value)) return "PAN must be 10 characters in format: ABCDE1234F";
    return null;
  },
  
  // Contact Info
  email: (value: string) => {
    if (!value?.trim()) return "Email address is required";
    if (!isValidEmail(value)) return "Please enter a valid email address";
    return null;
  },
  
  phone: (value: string) => {
    if (!value?.trim()) return "Phone number is required";
    if (!isValidPhone(value)) return "Phone number must be 10 digits starting with 6-9";
    return null;
  },
  
  address: (value: string) => {
    if (!value?.trim()) return "Address is required";
    if (value.trim().length < 10) return "Address must be at least 10 characters";
    return null;
  },
  
  city: (value: string) => {
    if (!value?.trim()) return "City is required";
    return null;
  },
  
  state: (value: string) => {
    if (!value?.trim()) return "State is required";
    return null;
  },
  
  pincode: (value: string) => {
    if (!value?.trim()) return "Pincode is required";
    if (!isValidPincode(value)) return "Pincode must be 6 digits";
    return null;
  },
  
  // Employment Info
  employmentType: (value: string) => {
    if (!value) return "Please select employment type";
    return null;
  },
  
  companyName: (value: string) => {
    if (!value?.trim()) return "Company name is required";
    return null;
  },
  
  designation: (value: string) => {
    if (!value?.trim()) return "Designation is required";
    return null;
  },
  
  workExperience: (value: string) => {
    const years = Number(value);
    if (!value) return "Work experience is required";
    if (isNaN(years) || years < 0) return "Please enter a valid number of years";
    return null;
  },
  
  monthlyIncome: (value: string) => {
    const income = Number(value);
    if (!value) return "Monthly income is required";
    if (isNaN(income) || income < 1000) return "Monthly income must be at least ₹1,000";
    if (income > 10000000) return "Monthly income cannot exceed ₹1,00,00,000";
    return null;
  },
};

// Helper function to validate a single field
export const validateField = (fieldName: string, value: any): string | null => {
  const rule = VALIDATION_RULES[fieldName];
  return rule ? rule(value) : null;
};

// Helper function to check if a field is valid
export const isFieldValid = (fieldName: string, value: any): boolean => {
  return validateField(fieldName, value) === null;
};