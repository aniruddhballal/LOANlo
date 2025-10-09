## 📋 Tasks & Features Overview

This section categorizes and tracks all ongoing, completed, and planned development tasks across key areas of the project.

---
<details>
  <summary>🎨 <strong>Frontend Design, UI/UX & Feature Enhancements</strong></summary>

  **Description:**  
  Tasks related to the design, enhancement, or modification of features, functionality, and visual elements of the application, aimed at improving user experience, intuitive navigation, usability, and overall interaction flow.

  <br/>

  <details>
    <summary>✅ <strong>Completed</strong></summary>
    
2. Implemented comprehensive styling for Login, Register, Dashboard, ApplicationStatus, Profile, LoanApplication, and DocumentUpload pages using modular CSS (module.css)
7. ~~Unified all module.css files to ensure consistent styling across pages~~ Deprecated vanilla module.css files
8. Enhanced application-wide styling by transitioning from a dark, inconsistent theme to a white-based, formal, corporate, sleek, and modern design system
12. Migrated from vanilla module.css to Tailwind CSS framework for improved maintainability and consistency
13. Integrated enhanced styling components and iconography from Tailwind CSS library
14. Refactored Login and Register page structures by converting div elements to semantic form tags
15. Implemented keyboard accessibility by enabling Enter key submission for Login and Register forms
18. Developed color-coded visual indicators to display fractional progress of document upload completion
19. Implemented conditional landing animations (Welcome/Congratulations/Error states) that dynamically respond to user actions and navigation context
20. Designed and implemented intuitive UI/UX flows for profile editing and deletion functionalities
25. Conducted comprehensive UI/UX audit and quality assurance review
36. Integrated loading spinners and skeleton screen components across all application pages to improve perceived performance
38. Implemented comprehensive success and error messaging system for all modals, forms, and submission workflows
45. Developed intelligent form behavior including auto-scroll, auto-close, and auto-highlight features for Personal Details form input fields to enhance error and success state visibility
49. Implemented skeleton loading components for Applicant Dashboard, Underwriter Dashboard, and RoleProtectedRoute component
50. Resolved UI obstruction issue affecting the bottom viewport area in Underwriter's LoanReviewModal
54. Fixed dimensional resize glitches occurring in individual document upload submission containers
55. Optimized document deletion functionality to prevent unnecessary full-page reloads on ApplicationStatus page
61. Standardized styling for delete confirmation modals across loan applications and documents, ensuring design consistency for dynamically created components
78. Enhanced "Save & Continue" button with custom cursor hover state for improved user feedback
79. Resolved persistent active state styling issue on "Previous" button that incorrectly carried over to subsequent pages after navigation
92. Implemented advanced search, sort, and filter capabilities for Underwriters to view specific loan applications with matching results display
93. Optimized Dashboard layout by expanding table width to eliminate unused whitespace and improve content density
94. Redesigned loan application display on ApplicationStatus page to match the styling pattern used for recent applications on Applicant Dashboard, subsequently removing redundant recent applications section from Dashboard
95. Adjusted Dashboard header alignment to accommodate wider tabular content layouts
96. Refined profile completion messaging to display "Personal details are required" only for newly created accounts, removing redundant completion messages for users with completed profiles
97. Replaced loading spinners with skeleton loaders on ApplicationStatus page for consistency with ApplicantDashboard implementation using SkeletonComponents
  </details>
  <br/>
  <details>
    <summary>⚡ <strong>Ongoing</strong></summary>

56. Refining "Begin Application Process" button styles to ensure consistency with application-wide design system
62. Enhancing styling and animation quality for individual field error displays on Personal Details page
81. Standardizing button styles and improving interactive feedback across all components, using "Save & Continue" button as design reference
  </details>
</details>
---

<details>
  <summary>🔒 <strong>Code Quality & Optimization, Security, Actual Bugs</strong></summary>

  **Description:**  
  Tasks focused on improving the underlying codebase, including structure, security, and optimization, to ensure maintainability, scalability, and adherence to best development practices.

  <details>
    <summary>✅ <strong>Completed</strong></summary>

1. Start project, make all the initial commits onto git
3. Shift from MongoDB Compass to MongoDB Atlas
4. Modularise the backend server code - break into more files and change the directory structure, consequentially
5. ~~User Password edit feature~~ Currently removed
6. ~~Ask User for password in case they want to edit their profile~~ edit profile feature doesnt ask for password right now, as there is no separate User profile and separate kyc - everything comes under user profile/personal details, and kyc has been redefined from filling text of "extra personal details form" to uploading legal documents that verify work, residence and other details
9. ~~Concept of KYC - create new collection to store UserKYC, set up routing. Check for KYC completion status before giving User access to features of the app.~~ There is a new definition of KYC now, there was a lot of redundancy with the old definition of kyc (which was just additional personal details - but no document as such) - now kyc is purely document based
10. Support multiple loan applications for a single individual
11. Allow for deletion of Loan Application
16. ~~User account deletion~~ Temporarily removed, waiting for better PII-KYC logic separation
17. Fix all the typescript compile errors
21. Create and Assign newer User roles - use them (session/login auth details) to navigate through pages of the website - user role driven access for the pages as the user navigates through
22. Role protected routing - dynamic redirection based on user details
23. Keep a check on the naming conventions of the pages, the features, the roles
24. Underwriter dashboard should have special functionalities and separate api calls? to display the loan applications? and user details?
26. State driven routing instead of parameter driven - usecase in DocumentsUpload page
27. Create modals that can be shared across the website, for all users (dynamic-user role-customisable)
28. Switch to central axios (central api.ts)
29. Global token expiration handling interceptor
30. Conditions to be met for underwriter to take any actions on the loan applications (statuses of the documents uploaded)
31. Add a global 403 Access Denied Page
32. Cross tab auth sync, on logout etc
33. Modularise the LoanReviewModal
34. Revamp the whole project directory structure
35. Review/Download/Delete functionality for all the uploaded documents
39. Remove the delete account feature
40. Modularise the KYC Component
41. Merge UserKYC and Personal User details collections - reflect it onto the frontend features
42. Modularise the Dashboard page, and make it user-dynamic for underwriter, admin and applicant (reusing same components, pass states and parameters)
43. Input validation for Aadhaar and PAN details etc, and prevention of sql injections, and invalid data in
44. Continue button in KYC/PII form has fire-forget model
46. Modularise LoanApplication page
47. Shift the entire backend from JavaScript to TypeScript
48. Add the Loan Application Delete functionality back - this time, make sure only applicants can delete it? Should under-writers have all that power? Check auto-refresh/re-render the loan applications once one has been deleted?
51. Clear up backend unused routes - loans.ts, profile.ts, documents.ts, auth.ts
53. LoanReviewModal features are not User Role specific - anyone can view/interact with the upload/delete documents buttons
58. Add a check if the current logged in user is the one who is even viewing/clicking on the delete application/documents button. dont need these checks for the Underwriter because they won't have these features either ways - only Applicants can delete the documents, or the entire loan application. Underwriter should not be able to delete application.
64. Pincode autofilling based on address
65. User can make the details incomplete and then navigate back and then can be stuck there - because the filed they need to fill, to complete the profile - is on the next page and the continue/next button is not taking them there because the details are incomplete - fix this bug
66. individual/ singular Field specific errors in the personal details filling pages are not shown right now, because errors are displayed only on handling the submit/next button and invalid entries in any of the input fields disable the submit/next/previous buttons - so, there is no clicking of the button, and hence there is no "error display" for any input - but it is visible that one of the inputs is invalid - so the user is stuck - fix this
67. Should failed Captcha attempts cause prevention of login for a while? like ratelimited?
68. doesnt handle edge cases where even after the captcha verification says incorrect answer, if i click on verify answer again for the same old answer, before the captcha modal closes, it updates the number of attempts (increments by one) taken - shouldnt happen
69. doesnt clear the number of captcha attempts completed/left on successful logins
70. log all the user-details/kyc updates - every update must be recorded with timestamp - profile history - new collection in backend
71. Applicant name in loanapplication collection does not reflect changes in the profile/user collection - it should not be redundantly stored as a new field, it should simply refer to the applicants userid, so any changes will happen in the user collection, and the loan application collection will point to the updated/new user collection
73. it doesnt show why the "continue" or the "previous" buttons are disabled in case of individual/singular invlaid format of inputs in the personal details form fields - so, modify the label/placeholder of the inputs in the personal details form, to hold the formats required for aadhaar, pan, DOB. another issue is that the errors thrown arent visible to the user only - the user is just prevented from going forward; currently it just says "enter <label_name>" - can modify to either including the format of the valid input along with the label, or be able to display the error (which does contain the right/valid format for the expected input)
74. deploy the website (render for backend, vercel for frontend)
76. there exists ratelimiting on profile complete/update, which when combined with the "invalid income range error" (invalid income range error is an exmpale of an error from a future/unfilled field in the personal details form being thrown in the step-1 of filling the personal details as a fresh applicant - and the save and continue button sends a post request to the backedn with new inputs from setp-1 but then inputs from steps 2- and 3 arent filled yet, so they are counted as empty and the backend doesnt allow for this invalid input - so i need to update/post only those fields that i fill in that particular step) for fresh applicants who havent filled any other detail out - is a deadly combination that must be prevented at all costs - Update the /save route or create new route for saving/updating partial details
84. after approving/rejecting (from the kid component of the actions tab) -> shouldn't load into actions tab again, because once loan is approved or rejected, access to the actions tab of a loan is not granted - so it throws an error. hence, switch to the application details tab of that loan as soon as the loan application is accepted or rejected
85. document view/download fetch api call differs for local vs deployed - take care of that
86. document storage issues - redployment, ephemeral issues - switch to persistent gridfs instead of renders ephemeral
87. on application status page, if all required documents are uploaded, then instead of "upload" button it should say "submit for review - this idea has been removed -> the loan application automatically gets "submitted" i.e., status changes from "pending" to "under_review"; this eliminates the extra complexity that used to come with "uploading all required documents" and then still having the "submit for review" button - from the applicant's side.
88. dont allow deletion of loan applications once approved - frontend and backend
98. dont allow deletion of documents once approved - frontend and backend

  </details>

  <details>
    <summary>⚡ <strong>Ongoing</strong></summary>

37. organise the flow between a loan's status changing from pending<->under_review->accepted/rejected/request_documents->pending<-> and back and forth
52. Implement Auth0/O-Auth
57. Allow User profile deletion
59. Should applicants be allowed to apply for multiple loans? What's the category of people who can do that? Is there a category?
60. Clean up the interfaces and props - might have fields that I am not using in that page
63. allow for gmaps pinpoint drop of location + change the loading animation for the pincode + modularise the pincode fetching thing into a new component maybe - check which other components can be modularised
72. consider renaming middleware auth.ts to middleware.ts and i feel that the original routes/auth.ts is growing too big?
75. integrate AI risk prediction/ credit assessment ai model (xgboost) into this mern stack app - i have the separate loan risk prediction streamlit app but it isnt integrable into this mern stack app
77. check if all ratelimiters are valid (it seems like it prevents all users from given ip address to not be able to update their profile if some other account has spammed profile update requests) - also check if the limits are set reasonably
80. add the delete account feature back, but then dont actually remove from database, but log it and make sure that it will not be login-able anymore for the user (unless you wanna add the 30-day to delete account feature where if you login within the span of 30 days of applying for account deletion, it will be revived)
82. fetch individual applicant profile details and show when underwriter clicks on any of the user's details (hover intimation) in the loan application -> and then, show history of profile updation for each individual applicant profile
83. user profile deletion? should it be allowed?
89. make sure every deletion does not actually mean deletion; keep logs of everything
90. when loan application gets approved - "Updated by: Unknown" is shown
91. what if applicant deletes a document right at the same time as the underwriter approving it
99. documents deletion, loan application deletion, profile deletion - how to store redundant copies of all of these?
100. storing personal details is plain right now, do i need to salt it or hash it like how im storing passwords? is the way im storing anything at all in the database secure right now?
101. adding to the underwriter's search/filter/sort feature - dont fetch all loan applications from the backend at once? load issue? fetch those loan applications which the underwriter searches for, instead of displaying all of them and then giving the search option?
102. auto logout after a certain time duration

  </details>

</details>