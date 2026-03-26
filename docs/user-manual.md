# User Manual

## 1. Purpose of this manual
This manual explains the complete functional scope of the SWU Erasmus Staff Mobility Portal in its current v1 form. It is written for all portal users, including staff members, officers, administrators, and local operators who need to understand the application structure, available actions, access rules, and normal workflows.

The manual reflects the current website as implemented. It does not describe functions that are planned for later phases but are not yet available.

## 2. System overview
The portal is an internal university administration system for Erasmus staff mobility. It supports the following operational areas:
- staff account registration and approval
- secure login and role-based access control
- editable institutional user profiles
- staff mobility case creation, draft saving, editing, and submission
- private document upload with version history
- officer review, comments, status changes, and document decisions
- administrator management of users, master data, and settings
- reporting and CSV export
- audit logging of protected actions

## 3. User roles and access states

### 3.1 Roles
| Role | Main responsibility | Main areas |
| --- | --- | --- |
| Staff | Manage own profile, own mobility cases, own document uploads, and own review follow-up | Home, Login, Register, Pending Approval, Status, Dashboard, My Profile, Staff Area, Case Detail |
| Officer | Review submitted cases, assess documents, add comments, change case status, archive completed cases, and use reports | Home, Login, Status, Dashboard, My Profile, Officer Area, Review Cases, Reports |
| Admin | Manage approvals, roles, account status, master data, upload settings, reporting settings, and audit records | Home, Login, Status, Dashboard, My Profile, Admin Area, User Management, Master Data, Audit Log, Reports |

### 3.2 Account states
| State | Meaning | Result |
| --- | --- | --- |
| Pending approval | Registration was submitted but not yet approved | User cannot enter the protected workspace and is redirected to the pending approval page |
| Approved | Account is allowed to use the portal | User can sign in and access the pages allowed for the assigned role |
| Rejected | Registration was reviewed and denied | User cannot access the protected workspace |
| Deactivated | Account access was removed by an administrator | User cannot access the protected workspace |

### 3.3 Access principles
- Staff users can work only with their own cases and documents.
- Officers can review all mobility cases and documents.
- Admins can manage users, master data, settings, and audit records.
- Protected routes are controlled on the server side.
- Uploaded files are private and are never served from a public folder.

## 4. Navigation through the website

### 4.1 Public navigation
The public area is available before login.

| Page | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Portal overview and entry point to login, registration, and local status |
| Status | `/status` | Local technical status, configuration summary, and readiness checks |
| Login | `/login` | Secure sign-in for approved users |
| Register | `/register` | Staff account request form |
| Pending Approval | `/pending-approval` | Informational page shown to pending users |

### 4.2 Protected workspace structure
After successful login, approved users enter the protected workspace.

The protected workspace includes:
- a left-side navigation panel with role-aware links
- a signed-in account panel showing the user name, email, role, and account status
- a page header on each screen with the current title and breadcrumb trail
- a sign-out button in the workspace header

### 4.3 Common protected navigation items
| Navigation item | Who sees it | Purpose |
| --- | --- | --- |
| Overview | All approved users | Common protected landing page |
| My profile | All approved users | Edit personal profile information |
| Staff area | Staff only | Staff dashboard and case overview |
| New case | Staff only | Create a new mobility case |
| Officer area | Officer and Admin | Review dashboard |
| Review cases | Officer and Admin | Search, filter, and review all cases |
| Reports | Officer and Admin | Operational reports and CSV export |
| Admin area | Admin only | Admin dashboard |
| User management | Admin only | Approvals, roles, and account access control |
| Master data | Admin only | Faculties, departments, years, statuses, select lists, and settings |
| Audit log | Admin only | Review explicit records of protected actions |

### 4.4 Breadcrumbs
Every major page shows a breadcrumb path near the top. Use breadcrumbs when you need to move back to the previous area without using the browser back button.

## 5. Public and account-access workflows

### 5.1 Home page
The home page provides:
- a short explanation of the portal purpose
- direct access to login
- direct access to registration for staff accounts
- direct access to the local status page
- role summaries for Staff Workspace, Officer Workspace, and Admin Workspace

If a user is already signed in, the primary action changes from `Open login` to `Open dashboard`.

### 5.2 Registering a staff account
Self-registration is available for staff accounts only.

### Steps
1. Open `Register` from the home page or public navigation.
2. Enter first name, last name, email, password, and password confirmation.
3. Submit the form.
4. The system creates the account in a pending approval state.
5. The user is redirected to the pending approval page.

### Important notes
- Registration does not create officer or admin accounts.
- Registration does not grant immediate workspace access.
- The portal validates the form before submission and returns clear error messages when data is incomplete or invalid.
- Duplicate email addresses are not allowed.

### 5.3 Logging in
Only approved accounts can enter the protected workspace.

### Steps
1. Open `Login`.
2. Enter email and password.
3. Select `Sign in`.
4. If the account is approved, the portal opens the protected dashboard.

### Login outcomes
- Approved account: access granted
- Pending account: redirected to the pending approval page
- Rejected or deactivated account: blocked from the protected workspace
- Invalid credentials: error message shown on the login form

### 5.4 Pending approval page
The pending approval page explains that:
- the registration exists in the system
- access is still disabled
- an administrator must approve the account
- rejected and deactivated accounts will not remain on this page and are instead sent back to login with the appropriate state message

### 5.5 Local status page
The `Status` page is intended for local operators, testers, and administrators. It shows:
- application readiness
- database readiness
- storage readiness
- selected non-secret environment settings
- current upload policy summary
- local operational checks

This page is useful when confirming that the local installation is running correctly.

## 6. Staff user guide

### 6.1 Staff dashboard
The staff dashboard is the main workspace for staff users.

It provides:
- current academic year
- total number of own cases
- number of draft cases
- number of submitted cases
- open task count
- case overview table
- current status areas
- missing documents panel
- latest comments panel
- open tasks panel
- direct links to the profile editor and new case form

### Typical use of the staff dashboard
Use the staff dashboard to:
- see whether you already have open or draft cases
- return to an unfinished draft
- identify missing required documents
- read recent review comments
- create a new case

### 6.2 Editing the user profile
The profile page is available through `My profile`.

### Profile fields
- first name
- last name
- email
- academic title
- faculty
- department

### Profile rules
- Faculty and department are linked. Department choices depend on the selected faculty.
- The portal validates profile changes on the server.
- The email address must remain unique.
- Profile information is used in case ownership, review, filtering, and reporting.

### Steps
1. Open `My profile`.
2. Review the current faculty and department values shown at the top of the page.
3. Update the profile fields as needed.
4. Save the form.
5. If the update is valid, the profile is refreshed immediately.

### 6.3 Creating a mobility case
Create a new case from `New case` or from the staff dashboard.

### Case fields
| Field | Required for submission | Notes |
| --- | --- | --- |
| Academic year | Yes | Must be selected from the master-data list |
| Mobility type | Yes | Teaching or Training |
| Host institution | Yes | Free-text field |
| Host country | Yes | Free-text field |
| Host city | Yes | Free-text field |
| Start date | Yes | Required for submission |
| End date | Yes | Required for submission; must not be earlier than the start date |
| Notes | No | Optional internal note |

### Steps
1. Open `New case`.
2. Enter the academic context.
3. Enter the host institution and location.
4. Enter the travel period.
5. Add notes if needed.
6. Choose one of the following actions:
   - `Save draft`
   - `Submit case`

### What `Save draft` does
- stores the case in the database
- keeps the case in `Draft` status
- allows the case to be reopened later

### What `Submit case` does
- validates the required fields and travel dates
- changes the case from draft to submitted
- records explicit status history
- ends staff editing until the workflow returns the case for changes

### 6.4 Reopening and editing a draft
Draft cases remain editable.

### Steps
1. Open `Staff area`.
2. In `Case overview`, select the relevant case.
3. Update the case form.
4. Save the draft again or submit the case.

### 6.5 Case detail page
Every case has a detail page.

The case detail page shows:
- breadcrumb navigation back to the staff workspace
- the current case status badge
- host institution, mobility type, and academic year summary
- last updated date
- submission date, if submitted
- the case form when the record is still editable
- a read-only notice when the case is not editable
- the stored case record values
- required document panels
- status history
- comments from officers and administrators

### When the case becomes read-only
A submitted case is not editable by staff until the workflow returns it for changes. The page remains visible, but the editing form is replaced with a read-only notice.

### 6.6 Uploading required documents
Each case requires two document types:
- Mobility Agreement
- Final Certificate of Attendance

### Document panel contents
Each document panel shows:
- the current document review state
- the current version label
- the latest uploaded filename
- the upload policy
- the latest review note, if available
- upload form or upload restriction message
- complete version history

### Upload rules
- files are validated against the allowed extension list
- files are validated against the maximum upload size
- each upload becomes a new version
- previous versions are preserved
- one version is marked as the current version

### Steps to upload a document
1. Open the relevant case detail page.
2. Go to `Required documents`.
3. In the correct document panel, choose a file.
4. Select `Upload document` or `Upload next version`.
5. Wait for the success message.
6. Review the updated version history.

### 6.7 Understanding document review state
Document review is separate from case status.

A document can be:
- not uploaded
- pending review
- accepted
- rejected

A rejected document does not automatically change the case status. Staff should review the document note and, where necessary, upload a corrected version.

### 6.8 Downloading documents
Staff can download their own uploaded document versions from the case detail page.

### Important notes
- downloads go through permission-checked routes
- old versions remain available in the version history
- staff cannot download documents belonging to another user’s case

### 6.9 Reading comments and status history
The case detail page contains:
- `Comments`: timestamped notes from officers or administrators
- `Status history`: a record of case status transitions over time

Use these panels to understand what happened to the case and what follow-up is required.

## 7. Officer user guide

### 7.1 Officer dashboard
The officer dashboard provides a review-oriented summary of the system.

It shows:
- new registrations
- new submitted cases
- cases with missing documents
- cases needing changes
- open reviews
- current academic year
- panel-based queues with direct links to the review register and reports

Officers can monitor pending registrations here, but approval decisions remain an administrator function.

### 7.2 Review register
Open `Review cases` to work with the full review register.

### Available tools
- text search
- combinable filters for status, academic year, faculty, department, mobility type, country, and host institution
- table view of matching cases
- visibility of archived cases

### Main use cases
- find a submitted case for first review
- isolate cases from a specific faculty or department
- find cases with missing documents
- return to archived cases for lookup or reporting

### 7.3 Opening a case for review
Select a case from the review register to open the officer case detail page.

The review detail page shows:
- case summary and staff information
- current case status
- assignment information
- case timestamps
- staff note
- workflow status form
- missing-document actions
- comment form
- document review panels
- reviewer comments with author and timestamp
- status history

### 7.4 Adding review comments
Use the `Leave comment` panel to record review observations.

### Comment behavior
- comments require text
- comments remain separate from status changes
- comments are visible later to staff and other reviewers
- comments show author and timestamp

### Steps
1. Open the review case detail page.
2. Enter the comment text.
3. Save the comment.
4. Confirm that the notice appears and the comment is listed.

### 7.5 Marking missing documents
If a required document has not been uploaded, the `Missing required documents` panel shows the gap.

### Steps
1. Open the case detail page.
2. In the missing-document section, find the required document.
3. Select `Mark as missing`.
4. The portal records a formal missing-document note.

This does not create a separate requested-changes workflow object. In v1, the note is recorded in the review trail.

### 7.6 Reviewing uploaded documents
Each document panel in the review area shows:
- current version
- latest file name
- latest review state
- version history
- secure download actions
- review note field
- `Accept current version` and `Reject current version` actions

### Document review rules
- review is version-specific
- document review state does not automatically change case status
- rejection requires a reason
- previous versions remain visible

### Accepting a document
1. Open the relevant document panel.
2. Optionally enter a note.
3. Select `Accept current version`.
4. Confirm that the review state changes accordingly.

### Rejecting a document
1. Open the relevant document panel.
2. Enter a reason in the review note field.
3. Select `Reject current version`.
4. Confirm that the rejection note appears in the review history.

### 7.7 Changing case status
Use the `Workflow status` panel to move the case through the formal process.

### Key rules
- case status changes are recorded explicitly
- document review and case status remain separate
- archived cases cannot continue through later status changes
- completed cases can be archived

### Steps
1. Open the case detail page.
2. In `Workflow status`, choose the new status.
3. Enter a transition note.
4. Save the status change.

### Archive action
If the case is already completed, the page shows `Archive completed case`.

Use this action when:
- the mobility case is fully complete
- no further workflow action is required
- the record should remain searchable and reportable but no longer active

## 8. Admin user guide

### 8.1 Admin dashboard
The admin dashboard gives an administrative overview of:
- new registrations
- new submitted cases
- cases with missing documents
- cases needing changes
- open reviews
- current academic year overview

It also provides direct access to:
- user management
- master data

### 8.2 User management
The `User management` page is used for account decisions and access control.

### Main actions
- approve a pending registration
- reject a pending registration
- change an approved user’s role
- deactivate a user account

### Important safeguards
- sensitive actions require explicit confirmation
- approvals and other user lifecycle actions are recorded in the audit log
- users cannot use protected pages unless both role and approval status allow it

### Approving a registration
1. Open `User management`.
2. Locate the pending staff account.
3. Select `Approve`.
4. The user becomes approved and can sign in.

### Rejecting a registration
1. Locate the pending account.
2. Type the user’s email in the confirmation field.
3. Select `Reject registration`.
4. The account remains blocked from the protected workspace.

### Changing a role
1. Locate the approved user.
2. Select the new role from the role assignment field.
3. Enter the required confirmation text if shown.
4. Save the role change.

### Deactivating a user
1. Locate the target account.
2. Use the deactivation action.
3. Enter the required confirmation text.
4. Confirm the action.

A deactivated user cannot sign in again until reactivated by later administrative action.

### 8.3 Master data and settings
The `Master data and settings` page controls the records used throughout the portal.

### Sections available
| Section | Purpose |
| --- | --- |
| Faculties | Maintain faculty records |
| Departments | Maintain faculty-linked department records |
| Academic years | Maintain academic year options used in case forms and reports |
| Statuses | Maintain case-status definitions |
| Select-list data | Maintain academic titles, mobility types, and document types |
| Upload settings | Define upload size and extension policy within environment limits |
| Report display settings | Control summary display options on reporting pages |

### Important rules
- departments must remain linked to faculties
- upload settings must stay within environment hard limits
- report display settings affect on-screen presentation, not the underlying export data
- these changes affect live forms, reporting, and operational behavior across the portal

### 8.4 Audit log
The `Audit log` page shows explicit records of protected actions.

Each row can include:
- timestamp
- actor
- action
- target
- summary
- structured details where recorded

### Typical uses
- review who approved or rejected a registration
- verify when a status changed
- confirm which actor reviewed a document
- review important user and settings changes

## 9. Reporting and CSV export

### 9.1 Access to reports
Reports are available to officers and admins.

### 9.2 Reporting page contents
The reporting page contains:
- headline metrics
- server-side filter form
- CSV export actions
- summary tables
- document gap table
- filtered case register

### Metrics shown
- filtered case count
- open versus completed counts
- archived count
- cases without mobility agreement
- cases without final certificate
- current summary row limit

### 9.3 Available filters
Reports can be filtered by:
- academic year
- faculty
- department
- mobility type
- country
- host institution
- status

Filters are combinable and applied on the server side.

### 9.4 Summary sections
Reports currently support summary views for:
- academic year
- faculty
- department
- mobility type
- host country
- status
- host institution
- document gaps

Archived cases remain visible in reporting when they match the selected filters.

### 9.5 CSV export options
The report page offers three CSV exports:
- filtered case register
- yearly summary
- faculty summary

### How to export
1. Open `Reports`.
2. Apply the required filters.
3. Select the required export action.
4. Save the downloaded CSV file locally.

## 10. Status reference

### 10.1 Case statuses
| Status | Meaning |
| --- | --- |
| Draft | Created by staff but not submitted |
| Submitted | Sent by staff for review |
| Agreement Uploaded | Mobility agreement is present |
| Under Review | Officer review is active |
| Approved | Case approved for progression |
| Mobility Ongoing | Mobility period is currently in progress |
| Certificate Uploaded | Final certificate is present |
| Completed | Case is complete |
| Changes Required | Officer requested corrections |
| Archived | Case is closed but remains searchable and exportable |

### 10.2 Document review states
| Review state | Meaning |
| --- | --- |
| Not uploaded | No file is currently stored |
| Pending review | Current version exists but has not yet been accepted or rejected |
| Accepted | Current version is accepted |
| Rejected | Current version was reviewed and rejected |

## 11. Security and permission boundaries
The portal enforces the following boundaries:
- public users can access only public pages
- only approved users can enter the protected workspace
- staff users can access only their own cases and own document files
- officers and admins can access review pages and protected review actions
- admins alone can manage users, settings, master data, and audit records
- all document downloads pass through permission checks
- uploaded files are stored privately outside the public web root

## 12. Typical user journeys

### 12.1 Staff journey
1. Register a staff account.
2. Wait for approval.
3. Log in.
4. Update profile details.
5. Create a case and save it as draft.
6. Reopen the draft and complete missing fields.
7. Submit the case.
8. Upload the mobility agreement.
9. Monitor officer comments and document review state.
10. Upload corrected versions if needed.
11. Upload the final certificate.
12. Review the final case history and archived result.

### 12.2 Officer journey
1. Log in.
2. Open the officer dashboard.
3. Open the review register.
4. Search or filter the required case.
5. Open the case detail page.
6. Add comments as needed.
7. Mark missing documents if necessary.
8. Accept or reject document versions.
9. Change the case status with an explicit note.
10. Archive the case once it is completed.
11. Use reporting and exports for operational follow-up.

### 12.3 Admin journey
1. Log in.
2. Open the admin dashboard.
3. Review new registrations.
4. Approve or reject pending accounts.
5. Change roles where needed.
6. Deactivate access when required.
7. Maintain faculties, departments, years, statuses, select lists, upload settings, and report settings.
8. Review the audit log when verification or traceability is required.

## 13. Known limits of the current website
The following items are not part of the current v1 scope:
- password reset and account recovery
- email verification
- bulk officer actions
- saved views and pagination for large operational queues
- non-CSV export formats
- advanced requested-changes workflows beyond comments, document review, and case status
- malware scanning or deep file inspection during upload
- hosted multi-instance storage behavior

## 14. Conclusion
The portal currently supports the full local v1 workflow for registration, approval, profile maintenance, mobility case handling, document versioning, officer review, reporting, and audit traceability. Users should work within the role boundaries described in this manual and rely on the page headers, breadcrumb trails, and left-side navigation to move through the system consistently.

