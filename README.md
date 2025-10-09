## 📋 Tasks & Features Overview

This section categorizes and tracks all ongoing, completed, and planned development tasks across key areas of the project.

---
<details>
  <summary>🎨 <strong>UI/UX & Feature Enhancements</strong></summary>

  **Description:**  
  Tasks related to the design, enhancement, or modification of features, functionality, and visual elements of the application, aimed at improving user experience, intuitive navigation, usability, and overall interaction flow.

  <br/>

  <details>
    <summary>✅ <strong>Completed</strong></summary>

2. Stylise the Login, Register, Dashboardpages, ApplicationStatus, Profile, LoanApplication and DocumentUpload pages (module.css)
7. ~~Unify all the module.css files, so the pages look alike in style~~ No more vanilla module.css files
8. Improve styles of all pages by shifting from the dark and irregularly styled theme into white based formal, corporate, sleek and modern design
12. Switch from vanilla module.css to Tailwind
13. Explore better styling formats and icons from Tailwind
14. Convert Login/Register div tags into form tags
15. Enter key should submit forms on the Login/Register pages
18. Show colours for fractional progress of total number of document uploads
19. Add conditional landing Welcome/Congratulations/Error animated displays based on what action of the user caused him or her to land on the page they landed
20. UI/UX for the edit/delete profile
25. UI/UX check
36. Loading/Buffer spinner states or skeletons for all the pages
38. Display success/error messages for all modals, forms, submits - check if these are better or toast messages are
45. Autoscroll, autoclose, auto-highlight the particular input fields in the personal details form to make errors/success states more visible to the User
49. Loading/Skeleton component display for the Applicant and Underwriter Dashboard page, and the RoleProtectedRoute component
50. Resolve the random block that covers the view at the bottom of the screen for Underwriter's LoanReviewModal
54. Individual document submission/uploading is causing glitches in all the individual document submitting boxes - take care of these size resize glitches
55. Deleting documents is causing entire ApplicationStatus page to reload - prevent this
61. Stylise the delete loan application/document confirmation modal - look into other features like this one component that have been created and added on the go - unify their styles
78. on hover of "save & continue" make the cursor turn into another design
79. on clicking previous button, it stays on the clicked/active state (has the thick black border) even in the "previous" page that it goes to - toggle its state once it goes back/forward
92. give underwriter the feature of searching/sorting/filtering to view particular selected loan applications - display only mathcing results
93. Empty waste space in the dashboard — make the table wider, to occupy the space
94. The way loan applications are displayed in the application status page can be made to match with the styles used to display the recent applications on the applicant dashboard - then, the recent applications can be removed from the dashboard  
95. Adjust dashboard header alignment to fit wide tabular content
96. Remove the "Personal details are complete" message for people who have completed their profile; only display the "personal details are required" message for the newly created accounts.
97. Use skeleton loaders in ApplicationStatus page (just like how its used in ApplicantDashboard which makes use of the SkeletonComponents file), instead of the loading spinners

  </details>

  <br/>

  <details>
    <summary>⚡ <strong>Ongoing</strong></summary>

56. Begin Application Process-> button onclick, has informal/unmatched styles
62. The individual field Error displays in personal details page are styled and animated poorly
81. stylise all the buttons, and make the interactiveness better - refer to the "save & continue" button in the personal details forms/page

  </details>

</details>

---

<details>
  <summary>🔒 <strong>Code Quality & Optimization, Security, Actual Bugs</strong></summary>

  **Description:**  
  Tasks focused on improving the underlying codebase, including structure, security, and optimization, to ensure maintainability, scalability, and adherence to best development practices.

  <details>
    <summary>✅ <strong>Completed</strong></summary>

1. Start project + initial commit
3. Shift from MongoDB Compass to MongoDB Atlas
4. Modularise the backend server code
5. ~~User Password edit feature~~ Currently removed
6. ~~Ask User for password in case they want to edit their profile~~ User profile and "kyc" has been merged
9. ~~Concept of KYC - create new collection to store UserKYC, set up routing. Check for KYC completion status before giving User access to features of the app.~~ There is a new definition of KYC now
10. Support multiple loan applications for a single individual
11. ~~Allow deletion of Loan Application~~ Temporarily removed
16. ~~User account deletion~~ Temporarily removed, waiting for better PII-KYC logic separation
17. Fix all ts compile errors
21. Create and Assign newer User roles - use them (session/login auth details) to navigate through pages of the website
22. Role protected routing - dynamic redirection
23. Keep a check on the naming conventions
24. Underwriter dashboard - special functions, and API calls
26. State driven routing instead of parameter driven - usecase in DocumentsUpload page
27. Create modals that can be shared across the website, for all users (dynamic-user-customisable)
28. Switch to central axios
29. Global token expiration handling interceptor
30. Conditions to be met for underwriter to take any actions on the loan applications (statuses of the documents uploaded)
31. Add a global 403 Access Denied Page
32. Cross tab auth sync
33. Modularise the LoanReviewModal
34. Revamp the whole project directory structure
35. Review/Download/Delete functionality for all the uploaded documents
37. Flow between pending<->under_review->accepted/rejected/request_documents->pending<->
39. Remove edit/delete account feature
40. Modularise the KYC Component
41. Merge UserKYC and PII/User details collections - reflect it onto the frontend features
42. Modularise the Dashboard page, and make it user-dynamic (reusing same components, pass states and parameters)
43. Input validation for Aadhaar and PAN details
44. Continue button in KYC/PII form has fire-forget model
46. Modularise LoanApplication page
47. Shift from JavaScript backend to TypeScript backend
48. Add the Loan Application Delete functionality back - this time, make sure only applicants can delete it? Should under-writers have all that power? Check auto-refresh/re-render the loan applications once one has been deleted?
51. Clear up backend unused routes - loans.ts, profile.ts, documents.ts, auth.ts
53. LoanReviewModal features are not User Role specific - anyone can view/interact with the upload/delete documents buttons
58. Add a check if the current logged in user is the one who is even viewing/clicking on the delete application/documents button. dont need these checks for the Underwriter because they won't have these features either ways - only Applicants can delete the documents, or the entire loan application. Underwriter should not be able to delete application.
64. Pincode autofilling based on address
65. User can make the details incomplete and then navigate back and then can be stuck there - because the filed they need to fill, to complete the profile - is on the next page and the continue/next button is not taking them there because the details are incomplete
66. Field specific errors are not shown right now, because errors are displayed only on handling the submit/next button and invalid entries in any of the input fields disable the submit/next/previous buttons - so, there is no clicking of the button, and hence there is no "error display" for any input - but it is visible that one of the inputs is invalid - so the user is stuck - fix this
67. Should failed Captcha attempts cause prevention of login for a while? like ratelimited?
68. doesnt handle edge cases where even after it says incorrect answer, if i click on verify answer again, before the modal closes, it updates the number of attempts taken - shouldnt happen
69. doesnt clear the number of captcha attempts completed/left on successful logins
70. log all the user-details/kyc updates - every update must be recorded with timestamp
71. Applicant name in loanapplication collection does not reflect changes in the profile/user collection - it should not be redundantly stored as a new field, it should simply refer to the applicants userid right
73. it doesnt show why the "continue" or the "previous" buttons are disabled in case of invlaid format of inputs in the personal details form fields - so, modify the label, to hold the formats required for aadhaar, pan, DOB - the errors arent thrown only - the user is just prevented from going forward; currently it just says "enter <label_name>"
74. deploy the website
76. profile complete/update rate limiting combined with the "invalid income range" for fresh applicants who havent filled any other detail out - is a deadly combination that must be prevented at all costs - Update the /save route or create new route for saving/updating details
84. after approving/rejecting (from the kid component of the actions tab) -> shouldn't load into actions tab again, because once loan is approved or rejected, access to the actions tab of a loan is not granted - so it throws an error. hence, switch to the application details tab of that loan as soon as the loan application is accepted or rejected
85. document view/download fetch api call differs for local vs deployed
86. document storage issues - redployment, ephemeral issues
87. on application status page, if all required documents are uploaded, then instead of "upload" button it should say "submit for review - this idea has been removed -> the loan application automatically gets "submitted" i.e., status changes from "pending" to "under_review"; this eliminates the extra complexity that used to come with "uploading all required documents" and then still having the "submit for review" button - from the applicant's side.
88. dont allow deletion of loan applications once approved - frontend and backend
98. dont allow deletion of documents once approved - frontend and backend

  </details>

  <details>
    <summary>⚡ <strong>Ongoing</strong></summary>

52. Implement Auth0/O-Auth
57. Allow User profile deletion
59. Should applicants be allowed to apply for multiple loans? What's the category of people who can do that? Is there a category?
60. Clean up the interfaces and props - might have fields that I am not using in that page
63. allow for gmaps pinpoint drop of location + change the loading animation for the pincode + modularise the pincode fetching thing into a new component maybe - check which other components can be modularised
72. consider renaming middleware auth.ts to middleware.ts and i feel that the original routes/auth.ts is growing too big?
75. integrate AI risk thingy
77. check if all ratelimiters are valid (it seems like it prevents all users from given ip address to not be able to update their profile if some other account has spammed profile update requests) - also check if the limits are set reasonably
80. add the delete account feature back, but then dont actually remove from database, but log it and make sure that it will not be login-able anymore for the user (unless you wanna add the 30-day to delete account feature where if you login within the span of 30 days of applying for account deletion, it will be revived)
82. fetch individual applicant profile details and show when underwriter clicks on any of the user's details (hover intimation) in the loan application -> and then, show history of profile updation for each individual applicant profile
83. user profile deletion? should it be allowed?
89. make sure every deletion does not actually mean deletion; keep logs of everything
90. when loan application gets approved - "Updated by: Unknown" is shown
91. what if applicant deletes a document right at the same time as the underwriter approving it
99. documents deletion, loan application deletion, profile deletion - how to store redundant copies of all of these?
100. storing personal details is plain right now, do i need to salt it - am i storing the passwords securely?
101. adding to the underwriter's search/filter/sort feature - dont fetch all loan applications from the backend at once? load issue? fetch those loan applications which the underwriter searches for, instead of displaying all of them and then giving the search option?

  </details>

</details>