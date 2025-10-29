import React from 'react'

interface PersonalDetails {
  firstName: string
  lastName: string
  email: string
  monthlyIncome: string
  employmentType: string
}

interface LoanData {
  loanTypeId: string  // Changed from loanType: string to loanTypeId
  amount: string
}

interface LoanType {
  _id: string
  title: string
  name: string
  maxAmount: number
  maxTenure: number
  interestRateMin: number
  interestRateMax: number
}

interface ApplicationSummaryProps {
  personalDetails: PersonalDetails
  loanData: LoanData
  selectedLoanType: LoanType  // Added selectedLoanType prop
}

export const ApplicationSummary: React.FC<ApplicationSummaryProps> = ({
  personalDetails,
  loanData,
  selectedLoanType  // Destructure the new prop
}) => (
  <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
    <h4 className="text-lg font-bold text-gray-900 mb-4">Application Summary</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <span className="font-semibold text-gray-700">Applicant:</span>
        <span className="ml-2 text-gray-600">{personalDetails.firstName} {personalDetails.lastName}</span>
      </div>
      <div>
        <span className="font-semibold text-gray-700">Email:</span>
        <span className="ml-2 text-gray-600">{personalDetails.email}</span>
      </div>
      <div>
        <span className="font-semibold text-gray-700">Monthly Income:</span>
        <span className="ml-2 text-gray-600">₹{personalDetails.monthlyIncome}</span>
      </div>
      <div>
        <span className="font-semibold text-gray-700">Employment:</span>
        <span className="ml-2 text-gray-600">{personalDetails.employmentType}</span>
      </div>
      {selectedLoanType && (
        <div>
          <span className="font-semibold text-gray-700">Loan Type:</span>
          <span className="ml-2 text-gray-600">{selectedLoanType.title}</span>
        </div>
      )}
      {loanData.amount && (
        <div>
          <span className="font-semibold text-gray-700">Loan Amount:</span>
          <span className="ml-2 text-gray-600">₹{loanData.amount}</span>
        </div>
      )}
    </div>
  </div>
)