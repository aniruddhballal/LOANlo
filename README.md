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
| 111 | **Registration Email Verification UI** | Added `registrationSuccess` state in `Register.tsx` to show a success screen when a user registers but still needs to verify their email, including instructions and verification info. |
| 114 | **Unified Loading Experience for Auth Routes** | Replaced the basic `LoadingSpinner` with the animated `LoadingState` component in both `RootRedirect` and `PublicRoute`, creating a consistent, elegant, and user-friendly loading experience during authentication and redirection. |
| 119 | **Auth Flow: Reuse Centralized Email Verification Component** | Refactored `Register.tsx` to remove inline email verification success UI and reuse the existing `EmailVerificationRequired.tsx` component. Implemented redirect via `navigate('/email-verification-required')` and stored pending user email in `localStorage` for persistence. This unifies verification UX across the app, improves maintainability, and ensures consistent flow between registration and login stages. |
| 122 | **Login Success Animation: Dynamic Message Based on Email Verification Status** | Fixed the login success animation to display the correct message based on email verification status. Added `isEmailVerified` state to `Login.tsx` to capture verification status from the login response immediately. Updated `AuthContext.tsx` to make the `login` function return `Promise<User>` instead of `Promise<void>`, and added `return data.user` statements in both success paths. Changed the success overlay to use `isEmailVerified` state instead of `user?.isEmailVerified` context. Now verified users see "Authentication Successful! Redirecting to dashboard..." while unverified users see "Login Successful! Please verify your email..." ensuring accurate feedback during the login animation. |
| 130 | **Upload Documents: Auto-Redirect After All Docs Uploaded** | In `UploadDocuments.tsx`, updated `uploadDocument` to check `allRequiredDocsUploaded` from API response. On `true`, call `navigate('/application-status')`. Handles post-upload redirect automatically when all 6 documents are uploaded. |
| 131 | **Application Status: Document Upload Animation on Redirect** | Added `highlightedAppId` and `animatingDocs` state in `ApplicationStatus.tsx`. `useEffect` detects `location.state.updatedApplicationId`, triggers `docStatusChange` keyframe on badge and `highlightCard` keyframe on card. Auto-scrolls via `scrollIntoView`, clears after timeout. Fixed `DocumentUpload.tsx` navigation syntax to pass state object with `updatedApplicationId`. |
| 132 | **Loan Application: Split Loading States** | In `LoanApplication.tsx`, separated `checkingPersonalDetails` and `loading` conditions. Added submission-specific loading state with "Submitting Application" title and email confirmation message. |
| 140 | **Reference Number Display Fix** | Fixing display of loan reference numbers on underwriter dashboard and applicant `ApplicationStatus` to show full 24-character ID instead of only last 8 characters |

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
| 57 | **Deletion Policy Evaluation** | Evaluated and implemented user profile deletion functionality with appropriate data retention policies *(Implemented under Task - 80)*|
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
| 80 | **Soft-Delete User Accounts** | Added backend endpoints for soft-deleting (`DELETE /profile/me`) and restoring (`POST /profile/restore/:userId`) users, updated frontend `Profile.tsx` to show delete modal, handle deletion with API call, and prevent login post-deletion |
| 82 | **Profile Management Feature** | Added "View History" button to `Profile.tsx` with conditional rendering (underwriters + self-access) using `handleViewHistory()` handler. Created `ProfileHistory.tsx` with `useParams`, fetching from `/profile-history/${userId}`, displaying chronological changes with old/new value comparison, change type badges, timestamps, IP addresses, and field snapshots. Implemented `profileHistory.ts` backend: `GET /api/profile-history/:userId` with dual authorization (underwriters + self), ObjectId validation, rate limiting (30/min), sorted descending, limit 1-100 (default 50); bonus `/stats` endpoint for analytics. Added protected route `/profile/history/:userId` in `App.tsx` with `RoleProtectedRoute` for underwriters and applicants. Registered `/api/profile-history` in server. Security via role-based access at frontend (conditional UI) and backend (auth middleware) |
| 84 | **Tab Switching Logic** | Implemented automatic tab switching from Actions to Application Details upon loan approval/rejection to prevent error states from unauthorized Actions tab access post-decision |
| 85 | **Environment Configuration** | Resolved environment-specific API endpoint discrepancies for document view/download functionality between local and deployed environments |
| 86 | **Storage Migration** | Migrated document storage from Render's ephemeral filesystem to persistent GridFS solution to ensure data durability across redeployments |
| 87 | **Workflow Automation** | Implemented automatic loan status transition from "pending" to "under_review" upon completion of required document uploads |
| 88 | **Data Protection** | Implemented frontend and backend safeguards preventing deletion of approved loan applications |
| 98 | **Document Protection** | Implemented frontend and backend safeguards preventing deletion of documents associated with approved loan applications |
| 104 | **Email Verification Gate for ApplicantDashboard** | Added email verification check to ApplicantDashboard - introduced isEmailVerified state, updated API call to fetch verification status, added red-themed email verification banner prompting users to check inbox, and modified logic to only display "Personal Details Required" section and "Complete Profile" button after email is verified, ensuring users must verify email before accessing profile completion |
| 105 | **Email Verification System** | Added `isEmailVerified`, `verificationToken`, and `verificationTokenExpiry` fields to the User schema, enabling backend support for email verification workflows |
| 106 | **Email Verification Endpoints** | Implemented `/verify-email` and `/resend-verification` routes with rate limiting (max 3 resends/hour), enabling secure and efficient backend handling of email verification and onboarding |
| 107 | **Email Service & Templates** | Created `emailService.ts` for sending verification, welcome, and resend emails via Nodemailer, and `emailTemplates.ts` for dynamic, branded HTML templates supporting LOANLO’s onboarding and account activation flow |
| 108 | **Verify Email Page (Frontend)** | Created `VerifyEmail.tsx` with full UI/UX for verifying, resending, and handling expired email links — featuring animated status states, secure redirects, and LOANLO-branded design |
| 109 | **Email Verification Gate (Personal Details)** | Added email verification check in `PersonalDetails.tsx`, restricting access to unverified users with a branded warning UI and redirect option to dashboard |
| 110 | **Email Verification & Auth Enhancements** | Extended `AuthContext.tsx` to include `isEmailVerified` in `User`, added `verifyEmail` and `resendVerification` methods, updated `register` to indicate if verification is required, enabling email verification flows across the app |
| 112 | **Auth Flow: Enable Registration Success Screen** | Modified `register()` in `AuthContext.tsx` by removing immediate user state update, allowing `requiresVerification` flag to trigger success screen display with email verification instructions before user proceeds to dashboard |
| 113 | **Auth Flow: Use ALLOWED_ORIGINS for Verification Link** | Modified email verification link generation to parse `ALLOWED_ORIGINS` environment variable instead of hardcoding `FRONTEND_URL`, ensuring correct link in both development and production environments |
| 115 | **Auth Flow: Post-Registration Login Behavior** | Implemented new flow for user access after successful registration — enabling login only after email verification via the verification link |
| 116 | **Auth Flow: Add Email Verification Required Component** | Created `EmailVerificationRequired.tsx` to display a dedicated screen prompting users to verify their email before accessing their account, with resend functionality, error handling, and navigation back to login for unverified users |
| 117 | **User Schema: Fix Optional Type Definitions** | Updated `IUser` interface in `User.ts` to explicitly allow `undefined` for `verificationToken` and `verificationTokenExpiry` fields, resolving strict TypeScript errors under `exactOptionalPropertyTypes` mode |
| 118 | **Router Structure: Fix AuthProvider Hook Context** | Restructured component hierarchy to wrap `<AuthProvider>` inside `<Router>` instead of vice versa, enabling `AuthContext` to use `useNavigate()` hook for programmatic navigation during authentication flows (e.g., redirecting to email verification page after login with unverified email) |
| 120 | **Auth Flow: Unified Resend Verification for Authenticated & Unauthenticated Users** | Refactored `/resend-verification` route in `backend/routes/auth.ts` to support both authenticated (token-based) and unauthenticated (email-based) requests, removing the need for forced login before verification. Implemented security-safe response for non-existent emails. Updated `AuthContext.tsx` to automatically include the user’s email in the resend request when available, ensuring smooth behavior for both logged-in and pending-verification users. This improves usability, maintains security, and aligns frontend–backend verification flow. |
| 121 | **Auth Flow: Fix Email Verification Double-Call and Already-Verified Error** | Resolved critical bug where clicking verification link would briefly show success then immediately display "Verification Failed: Email is already verified" error. Modified backend `auth.ts` to return success response (200) instead of error (400) when email is already verified, and fixed Mongoose field deletion using `undefined`. Updated `AuthContext.tsx` to prevent duplicate verification API calls using `useRef` flag and removed redundant second `/auth/verify` call causing race conditions. Enhanced `VerifyEmail.tsx` with `useRef` to prevent React StrictMode double-execution, simplified `useEffect` dependencies to only track token value, added graceful "already verified" handling to show success screen, and fixed template literal bug in dashboard navigation. |
| 123 | **Email Service: Migrated from SMTP to SendGrid API** | Replaced Nodemailer SMTP configuration with SendGrid API integration in `emailService.ts`, simplifying deployment and ensuring reliable email delivery on cloud platforms. Updated `.env` to use `SENDGRID_API_KEY` and `EMAIL_FROM` instead of SMTP credentials. |
| 124 | **Email Verification: Merged duplicate components into single intelligent component** | Consolidated `VerifyEmail.tsx` and `EmailVerificationRequired.tsx` into a single `EmailVerification.tsx` component that intelligently handles both token-based verification (from email links) and awaiting verification states. The component detects URL token presence to determine flow, eliminating ~400 lines of duplicate code while maintaining all functionality. Updated `App.tsx` routing to use single component for both `/verify-email` and `/email-verification-required` paths. |
| 125 | **Email Verification: Implemented automatic login after email verification** | Modified backend `/auth/verify-email` endpoint to return JWT token upon successful verification, enabling seamless auto-login. Updated `AuthContext.verifyEmail()` to store token in localStorage and update user state. Enhanced `EmailVerification.tsx` to check for token after verification and automatically redirect users to their dashboard via root route, eliminating the need for manual login post-verification. Users now experience a smooth flow: click verification link → see success message → auto-redirect to dashboard. |
| 128 | **SMTP Email Transport** | ~~Tried switching email delivery system from SendGrid back to SMTP with Nodemailer for improved control and reliability~~ *(Deprecated: Render and most free hosting providers block SMTP; use an email API (SendGrid, Resend, Mailgun) instead.)* |
| 129 | **Automated Email Notifications: Implemented comprehensive loan application email system** | Created modular email system with separate templates (`loanApplicationSubmittedTemplate.ts`, `loanStatusUpdateTemplate.ts`, `newApplicationNotificationTemplate.ts`, `documentsRequestedTemplate.ts`) and centralized `loanEmailService.ts` using SendGrid. Integrated four notification triggers into `routes/loans.ts`: applicant confirmation on submission, status updates with conditional approval/rejection content, underwriter alerts via `UNDERWRITER_EMAILS` env variable on review submission, and document request notifications. Modified endpoints (`/apply`, `/update-status/:applicationId`, `/request-documents/:applicationId`, `/:applicationId/submit-for-review`) to trigger emails with responsive HTML templates, application tracking, and dashboard links. |
| 133 | **Profile Page & Navigation Button** | Created `Profile.tsx` with comprehensive user information display including personal details, identity documents, contact info, employment details, and account status — featuring sectioned layouts, formatted data display, and edit profile CTA. Added Profile navigation button to `DashboardHeader.tsx` with user icon, hover effects, and route integration for seamless profile access |
| 135 | **Underwriter Profile Access** | Added "Visit Profile" button to `ApplicationDetailsTab.tsx` with role-based visibility (underwriters only) using `User` icon, `useNavigate` hook, and `handleVisitProfile()` handler. Created backend route `GET /api/profile/:userId` in `profile.ts` with underwriter-only authorization, ObjectId validation, and soft-delete checks. Modified `Profile.tsx` to support dual-mode operation via `useParams` - dynamically fetching `/profile/me` or `/profile/${userId}`, conditional header/button rendering (back button for underwriter view, edit/delete hidden for other profiles). Added protected route `/profile/:userId` in `App.tsx` with `RoleProtectedRoute`. Security enforced at frontend (conditional rendering) and backend (role validation) |
| 136 | **Underwriter Email Notifications: Moved auto-review email trigger to document upload** | Refactored email logic for underwriter notifications by moving it from the unused `/submit-for-review` route to the `/upload` route. Now, when the final required document is uploaded and the application status auto-updates to `under_review`, underwriters receive notification emails and applicants receive status update emails. Discovered that the frontend “Submit for Review” button was never rendered due to automatic status updates, allowing removal of redundant UI elements. |
| 141 | **Global Utils Refactor & Time-Based Greeting** | Moved `utils.ts` from `loan/loanreviewmodal/` to top-level `frontend/src/components/utils.ts` to improve reusability across shared components like `DashboardHeader.tsx` and `Profile.tsx`. Removed redundant re-exports from `loanreviewmodal/index.ts`. Updated all dependent imports to reference the new global utils path. Added new `getGreeting()` utility to generate dynamic greetings based on the current time of day. |
| 142 | **Soft-Delete Loan Applications** | Added `isDeleted` and `deletedAt` fields to `LoanApplication` model, modified `DELETE /:applicationId` endpoint to perform soft delete instead of hard delete, added pre-find middleware to automatically exclude deleted applications from queries, and created optional endpoints for restoring (`PATCH /restore/:applicationId`) and viewing deleted applications (`GET /deleted` for underwriters) |
| 143 | **View Deleted Loan Applications (Underwriter)** | Added toggle button in `UnderwriterDashboard.tsx` to switch between active and deleted applications view, created `fetchDeletedApplications` function and state management for deleted applications, implemented `GET /loans/deleted` endpoint for underwriters to retrieve soft-deleted applications, and modified pre-find middleware in `LoanApplication` model to allow explicit querying of deleted documents when `isDeleted: true` is specified |
You're right! The backend endpoint was created earlier as an "optional" feature. Here's the corrected task message:
| 144 | **Restore Deleted Loan Applications (Underwriter)** | Added restore confirmation modal in `UnderwriterDashboard.tsx` requiring "RESTORE" text input for verification, conditionally rendered "Restore" buttons in place of "Review" buttons when viewing deleted applications, and implemented `handleRestoreClick` and `handleRestoreConfirm` functions to manage restoration workflow with dual list refresh |

### ⚡ In Progress

| ID | Initiative | Status |
|----|-----------|--------|
| 37 | **State Machine Design** | Designing comprehensive state machine logic for loan status transitions across pending ↔ under_review → approved/rejected/request_documents → pending states with bidirectional flow management |
| 52 | **OAuth Integration** | Integrating Auth0/OAuth authentication infrastructure for enhanced security and third-party authentication support |
| 59 | **Business Logic Definition** | Defining business logic for multiple concurrent loan applications, including eligibility criteria and user categorization |
| 60 | **Interface Optimization** | Auditing and optimizing interfaces and props across components to remove unused fields and improve type safety |
| 63 | **Location Services** | Implementing Google Maps location pinpointing functionality, modernizing pincode loading animations, and evaluating component modularization opportunities |
| 72 | **Middleware Restructuring** | Evaluating middleware restructuring including potential renaming of auth.ts to middleware.ts and refactoring of routes/auth.ts |
| 75 | **AI Integration** | Integrating XGBoost-based AI risk prediction and credit assessment model from standalone Streamlit application into MERN stack architecture |
| 77 | **Rate-Limiting Audit** | Auditing rate-limiting implementation to ensure IP-based restrictions don't inadvertently affect legitimate users |
| 83 | **Permissions Framework** | Finalizing decision framework for user profile deletion permissions and implementation approach |
| 89 | **Audit Trail System** | Implementing comprehensive audit trail system ensuring all deletion operations are logged rather than permanently removed from database |
| 90 | **Attribution Bug Fix** | Resolving "Updated by: Unknown" display issue occurring when loan applications receive approval status |
| 91 | **Conflict Resolution** | Implementing conflict resolution mechanism for concurrent document deletion by Applicant during Underwriter approval process |
| 99 | **Data Archival Strategy** | ~~Designing and implementing redundant data archival strategy for deleted documents, loan applications, and user profiles~~ *(Deprecated: (ONLY LOANS AND PROFILES) Document Deletion should not be archived/soft. Profile deletions are soft already, implemented in Task - 80, only pending function is the soft delete the loan applications themselves)* |
| 100 | **Security Evaluation** | Evaluating security requirements for personal data storage, including potential implementation of salting and hashing mechanisms |
| 101 | **Performance Optimization** | Optimizing Underwriter dashboard performance by implementing on-demand data fetching with search/filter/sort parameters |
| 102 | **Session Management** | Implementing automatic session timeout and logout functionality after defined period of user inactivity |
| 126 | **Google reCAPTCHA Integration** | Replacing custom numeric CAPTCHA with Google reCAPTCHA for enhanced bot protection |
| 127 | **Passwordless Authentication** | Implementing Google passwordless login/signup to replace traditional email and password authentication |
| 134 | **Restore Account Endpoint (Frontend)** | Implementing frontend UI and API integration for admin-triggered account restoration via `POST /profile/restore/:userId` |
| 137 | **Approval/Reject Comments Visibility** | Evaluating how and where underwriter comments on approvals/rejections should be visible to applicants (modal or email) |
| 138 | **Loan Action History Attribution** | Fixing underwriter actions on loan applications being logged as "unknown" in status history |
| 139 | **Request for Additional Documents** | Auditing backend support and UX for additional document requests, ensuring `UploadDocuments.tsx` renders "additional documents" only after underwriter request, improving frontend headings/subheadings to distinguish required vs additional documents, and verifying Indian mandatory vs additional document requirements |
| 145 | **View & Restore Deleted User Profiles (Underwriter)** | Add toggle button in `UnderwriterDashboard.tsx` to switch between active and deleted user profiles, implement `GET /profile/deleted` endpoint for underwriters to retrieve soft-deleted user accounts, create restore confirmation modal requiring text verification, and add `PATCH /profile/restore/:userId` endpoint with frontend handlers to restore deleted user profiles with list refresh |
| 146 | **Restrict Deleted Records Access to System Admin** | Update authorization middleware to restrict viewing and restoring soft-deleted loan applications and user profiles to `system_admin` role only, remove deleted records access from underwriter dashboard, add permanent delete endpoints (`DELETE /loans/permanent/:applicationId` and `DELETE /profile/permanent/:userId`) for system admins, and implement role-based access control checks in all relevant backend routes |
| 147 | **System Admin Database Overview Dashboard** | Create comprehensive system admin dashboard to display all database tables (Users, LoanApplications, Documents, etc.), implement data grid views with filtering and sorting for each table, add statistics and analytics widgets showing total records, active/deleted counts, and recent activity, and provide navigation between different database collections with read-only access to all fields |

---

**Document Version:** 114
**Last Updated:** 18th October 2025
**Maintained By:** Aniruddh Ballal