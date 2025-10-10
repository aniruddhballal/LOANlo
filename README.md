# Project Development Roadmap

> **Comprehensive task tracking and feature management across all development domains**

---

## Table of Contents

- [Frontend Design, UI/UX & Feature Enhancements](#frontend-design-uiux--feature-enhancements)
- [Backend Development, Security & Architecture](#backend-development-security--architecture)

---

## Frontend Design, UI/UX & Feature Enhancements

**Domain Focus:** Visual design, interactive components, user interface refinement, and accessibility improvements to deliver an exceptional user experience aligned with modern corporate standards.

### ✅ Completed Initiatives

| ID | Initiative | Description |
|----|-----------|-------------|
| 2 | **Styling Framework Implementation** | Implemented comprehensive styling for Login, Register, Dashboard, ApplicationStatus, Profile, LoanApplication, and DocumentUpload pages using modular CSS architecture |
| 7 | **CSS Consolidation** | ~~Unified all module.css files to ensure consistent styling across pages~~ *(Deprecated: Transitioned to vanilla module.css)* |
| 8 | **Design System Overhaul** | Enhanced application-wide styling by transitioning from dark, inconsistent theme to white-based, formal, corporate, sleek, and modern design system |
| 12 | **Tailwind CSS Migration** | Migrated from vanilla module.css to Tailwind CSS framework for improved maintainability and consistency |
| 13 | **Component Library Integration** | Integrated enhanced styling components and iconography from Tailwind CSS library |
| 14 | **Semantic HTML Refactoring** | Refactored Login and Register page structures by converting div elements to semantic form tags |
| 15 | **Accessibility Enhancement** | Implemented keyboard accessibility by enabling Enter key submission for Login and Register forms |
| 18 | **Progress Visualization** | Developed color-coded visual indicators to display fractional progress of document upload completion |
| 19 | **Dynamic Landing States** | Implemented conditional landing animations (Welcome/Congratulations/Error states) that dynamically respond to user actions and navigation context |
| 20 | **Profile Management UX** | Designed and implemented intuitive UI/UX flows for profile editing and deletion functionalities |
| 25 | **Quality Assurance Review** | Conducted comprehensive UI/UX audit and quality assurance review |
| 36 | **Performance Optimization** | Integrated loading spinners and skeleton screen components across all application pages to improve perceived performance |
| 38 | **Feedback System** | Implemented comprehensive success and error messaging system for all modals, forms, and submission workflows |
| 45 | **Intelligent Form Behavior** | Developed intelligent form behavior including auto-scroll, auto-close, and auto-highlight features for Personal Details form input fields to enhance error and success state visibility |
| 49 | **Skeleton Loading Implementation** | Implemented skeleton loading components for Applicant Dashboard, Underwriter Dashboard, and RoleProtectedRoute component |
| 50 | **Modal Viewport Fix** | Resolved UI obstruction issue affecting the bottom viewport area in Underwriter's LoanReviewModal |
| 54 | **Container Optimization** | Fixed dimensional resize glitches occurring in individual document upload submission containers |
| 55 | **Performance Enhancement** | Optimized document deletion functionality to prevent unnecessary full-page reloads on ApplicationStatus page |
| 61 | **Modal Consistency** | Standardized styling for delete confirmation modals across loan applications and documents, ensuring design consistency for dynamically created components |
| 78 | **Interactive Feedback** | Enhanced "Save & Continue" button with custom cursor hover state for improved user feedback |
| 79 | **Button State Fix** | Resolved persistent active state styling issue on "Previous" button that incorrectly carried over to subsequent pages after navigation |
| 92 | **Advanced Data Operations** | Implemented advanced search, sort, and filter capabilities for Underwriters to view specific loan applications with matching results display |
| 93 | **Layout Optimization** | Optimized Dashboard layout by expanding table width to eliminate unused whitespace and improve content density |
| 94 | **UI Consolidation** | Redesigned loan application display on ApplicationStatus page to match the styling pattern used for recent applications on Applicant Dashboard, subsequently removing redundant recent applications section from Dashboard |
| 95 | **Header Alignment** | Adjusted Dashboard header alignment to accommodate wider tabular content layouts |
| 96 | **Contextual Messaging** | Refined profile completion messaging to display "Personal details are required" only for newly created accounts, removing redundant completion messages for users with completed profiles |
| 97 | **Loading Consistency** | Replaced loading spinners with skeleton loaders on ApplicationStatus page for consistency with ApplicantDashboard implementation using SkeletonComponents |
| 103 | **PersonalDetailsRequired Page Styling** | Updated PersonalDetailsRequired component to match email verification page styling - replaced gradient header and decorative elements with centered card layout, changed from red to amber theme, simplified to font-light typography, matched button styling with dashboard theme (gray-900), added back arrow icon, and reduced visual complexity for more formal, professional appearance |
### ⚡ In Progress

| ID | Initiative | Status |
|----|-----------|--------|
| 56 | **Button Style Refinement** | Refining "Begin Application Process" button styles to ensure consistency with application-wide design system |
| 62 | **Error Display Enhancement** | Enhancing styling and animation quality for individual field error displays on Personal Details page |
| 81 | **Interactive Feedback Standardization** | Standardizing button styles and improving interactive feedback across all components, using "Save & Continue" button as design reference |

---

## Backend Development, Security & Architecture

**Domain Focus:** Infrastructure development, security implementation, architectural optimization, and system scalability to ensure robust, maintainable, and enterprise-grade application foundation.

### ✅ Completed Initiatives

| ID | Initiative | Description |
|----|-----------|-------------|
| 1 | **Project Initialization** | Initialized project repository and established version control with initial Git commits |
| 3 | **Database Migration** | Migrated database infrastructure from MongoDB Compass to MongoDB Atlas for enhanced scalability and cloud-based management |
| 4 | **Backend Refactoring** | Refactored backend server architecture through modularization, implementing improved file structure and optimized directory organization |
| 5 | **Password Management** | ~~Implemented User Password edit feature~~ *(Feature temporarily deprecated)* |
| 6 | **Authentication Workflow** | ~~Implemented password verification requirement for profile editing~~ *(Removed: Personal Details and KYC consolidated into unified system)* |
| 9 | **KYC Architecture Redesign** | ~~Implemented KYC system with dedicated UserKYC collection~~ *(Redefined: Transitioned to document-based verification model)* |
| 10 | **Multi-Application Support** | Implemented support for multiple concurrent loan applications per individual user |
| 11 | **Application Management** | Developed loan application deletion functionality with appropriate safeguards |
| 16 | **Account Management** | ~~Implemented user account deletion functionality~~ *(Temporarily removed pending PII-KYC logic separation)* |
| 17 | **Type Safety** | Resolved all TypeScript compilation errors to ensure type safety across the codebase |
| 21 | **Access Control System** | Implemented role-based access control system with new user roles, leveraging session authentication to enforce role-driven page navigation |
| 22 | **Protected Routing** | Developed role-protected routing with dynamic redirection based on user credentials and permissions |
| 23 | **Naming Conventions** | Established and enforced consistent naming conventions across pages, features, and user roles |
| 24 | **Underwriter Dashboard** | Developed specialized Underwriter Dashboard with role-specific functionalities and dedicated API endpoints for loan application and user data retrieval |
| 26 | **Routing Refactoring** | Refactored routing architecture from parameter-driven to state-driven navigation, implemented in DocumentsUpload page |
| 27 | **Modal Components** | Developed reusable modal components with dynamic customization capabilities based on user roles |
| 28 | **API Centralization** | Migrated to centralized Axios configuration (api.ts) for consistent API communication |
| 29 | **Token Management** | Implemented global token expiration handling with request interceptors for seamless authentication management |
| 30 | **Workflow Prerequisites** | Established prerequisite conditions for Underwriter actions on loan applications based on document upload status validation |
| 31 | **Error Handling** | Implemented global 403 Access Denied page for unauthorized access attempts |
| 32 | **Cross-Tab Synchronization** | Developed cross-tab authentication synchronization to handle logout events across multiple browser tabs |
| 33 | **Component Modularization** | Refactored LoanReviewModal into modular components for improved maintainability |
| 34 | **Architecture Restructuring** | Restructured entire project directory architecture for enhanced organization and scalability |
| 35 | **Document Management** | Implemented comprehensive review, download, and delete functionality for all uploaded documents |
| 39 | **Feature Deprecation** | Removed account deletion feature from production environment |
| 40 | **KYC Modularization** | Refactored KYC component into modular, reusable architecture |
| 41 | **Data Model Consolidation** | Consolidated UserKYC and Personal User Details collections into unified data model with corresponding frontend integration |
| 42 | **Dashboard Abstraction** | Refactored Dashboard page into role-agnostic modular components supporting Underwriter, Admin, and Applicant roles through dynamic state and parameter passing |
| 43 | **Input Validation** | Implemented comprehensive input validation for Aadhaar, PAN, and other sensitive fields, including SQL injection prevention and invalid data sanitization |
| 44 | **Request Optimization** | Resolved fire-and-forget model issue in KYC/PII form "Continue" button to ensure proper request completion |
| 46 | **Application Refactoring** | Refactored LoanApplication page into modular component architecture |
| 47 | **TypeScript Migration** | Migrated entire backend codebase from JavaScript to TypeScript for enhanced type safety and developer experience |
| 48 | **Deletion Authorization** | Reimplemented Loan Application deletion with role-based access control restricting deletion to Applicants only, including automatic UI refresh post-deletion |
| 51 | **Route Cleanup** | Performed comprehensive cleanup of unused backend routes across loans.ts, profile.ts, documents.ts, and auth.ts |
| 53 | **Permission Management** | Implemented role-based access control for LoanReviewModal features, restricting document upload/delete interactions based on user permissions |
| 58 | **Authorization Verification** | Implemented authentication verification to ensure only the authorized user can access delete functionality for applications and documents, with Underwriter-specific restrictions preventing deletion capabilities |
| 64 | **Address Automation** | Implemented automated pincode-based address autofill functionality |
| 65 | **Navigation Bug Fix** | Resolved navigation bug preventing users from completing profile when required fields existed on subsequent pages due to incomplete data validation blocking forward navigation |
| 66 | **Field-Level Validation** | Enhanced field-specific error display in Personal Details forms to show validation errors for individual inputs without requiring form submission |
| 67 | **Security Enhancement** | Implemented rate-limiting mechanism for failed CAPTCHA attempts to prevent brute-force attacks |
| 68 | **Edge Case Resolution** | Resolved edge case where repeated verification attempts for incorrect CAPTCHA answers inappropriately incremented attempt counter before modal closure |
| 69 | **Counter Reset Logic** | Implemented CAPTCHA attempt counter reset upon successful login to prevent persistent attempt tracking |
| 70 | **Audit Logging** | Implemented comprehensive audit logging system for all user details and KYC updates, recording timestamps in dedicated profile history collection |
| 71 | **Data Architecture Optimization** | Eliminated redundant applicant name storage in loan application collection by implementing reference-based architecture pointing to user collection |
| 73 | **User Guidance Enhancement** | Enhanced user experience in Personal Details form by adding input format specifications to labels/placeholders for Aadhaar, PAN, and DOB fields |
| 74 | **Production Deployment** | Deployed application infrastructure with Render for backend services and Vercel for frontend hosting |
| 76 | **Rate-Limiting Refinement** | Resolved critical issue combining rate-limiting on profile completion/update with validation errors by implementing step-specific partial data persistence through dedicated save route |
| 84 | **Tab Switching Logic** | Implemented automatic tab switching from Actions to Application Details upon loan approval/rejection to prevent error states from unauthorized Actions tab access post-decision |
| 85 | **Environment Configuration** | Resolved environment-specific API endpoint discrepancies for document view/download functionality between local and deployed environments |
| 86 | **Storage Migration** | Migrated document storage from Render's ephemeral filesystem to persistent GridFS solution to ensure data durability across redeployments |
| 87 | **Workflow Automation** | Implemented automatic loan status transition from "pending" to "under_review" upon completion of required document uploads |
| 88 | **Data Protection** | Implemented frontend and backend safeguards preventing deletion of approved loan applications |
| 98 | **Document Protection** | Implemented frontend and backend safeguards preventing deletion of documents associated with approved loan applications |
| 104 | **Email Verification Gate for ApplicantDashboard** | Added email verification check to ApplicantDashboard - introduced isEmailVerified state, updated API call to fetch verification status, added red-themed email verification banner prompting users to check inbox, and modified logic to only display "Personal Details Required" section and "Complete Profile" button after email is verified, ensuring users must verify email before accessing profile completion |
| 105 | **Email Verification System** | Added `isEmailVerified`, `verificationToken`, and `verificationTokenExpiry` fields to the User schema, enabling backend support for email verification workflows |
| 106 | **Email Verification Endpoints** | Implemented `/verify-email` and `/resend-verification` routes with rate limiting (max 3 resends/hour), enabling secure and efficient backend handling of email verification and onboarding |


### ⚡ In Progress

| ID | Initiative | Status |
|----|-----------|--------|
| 37 | **State Machine Design** | Designing comprehensive state machine logic for loan status transitions across pending ↔ under_review → approved/rejected/request_documents → pending states with bidirectional flow management |
| 52 | **OAuth Integration** | Integrating Auth0/OAuth authentication infrastructure for enhanced security and third-party authentication support |
| 57 | **Deletion Policy Evaluation** | Evaluating and implementing user profile deletion functionality with appropriate data retention policies |
| 59 | **Business Logic Definition** | Defining business logic for multiple concurrent loan applications, including eligibility criteria and user categorization |
| 60 | **Interface Optimization** | Auditing and optimizing interfaces and props across components to remove unused fields and improve type safety |
| 63 | **Location Services** | Implementing Google Maps location pinpointing functionality, modernizing pincode loading animations, and evaluating component modularization opportunities |
| 72 | **Middleware Restructuring** | Evaluating middleware restructuring including potential renaming of auth.ts to middleware.ts and refactoring of routes/auth.ts |
| 75 | **AI Integration** | Integrating XGBoost-based AI risk prediction and credit assessment model from standalone Streamlit application into MERN stack architecture |
| 77 | **Rate-Limiting Audit** | Auditing rate-limiting implementation to ensure IP-based restrictions don't inadvertently affect legitimate users |
| 80 | **Soft-Delete Architecture** | Reimplementing account deletion with soft-delete architecture, maintaining database records while preventing login access, with optional 30-day grace period |
| 82 | **Profile Management Feature** | Developing Underwriter feature to fetch and display individual applicant profile details on-demand, including comprehensive profile update history |
| 83 | **Permissions Framework** | Finalizing decision framework for user profile deletion permissions and implementation approach |
| 89 | **Audit Trail System** | Implementing comprehensive audit trail system ensuring all deletion operations are logged rather than permanently removed from database |
| 90 | **Attribution Bug Fix** | Resolving "Updated by: Unknown" display issue occurring when loan applications receive approval status |
| 91 | **Conflict Resolution** | Implementing conflict resolution mechanism for concurrent document deletion by Applicant during Underwriter approval process |
| 99 | **Data Archival Strategy** | Designing and implementing redundant data archival strategy for deleted documents, loan applications, and user profiles |
| 100 | **Security Evaluation** | Evaluating security requirements for personal data storage, including potential implementation of salting and hashing mechanisms |
| 101 | **Performance Optimization** | Optimizing Underwriter dashboard performance by implementing on-demand data fetching with search/filter/sort parameters |
| 102 | **Session Management** | Implementing automatic session timeout and logout functionality after defined period of user inactivity |

---

**Document Version:** 67
**Last Updated:** 9th October 2025
**Maintained By:** Aniruddh Ballal