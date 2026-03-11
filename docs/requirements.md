# Requirements

## Product
Internal Erasmus+ staff mobility portal for university staff, officers, and admins.

## Main purpose
The portal must support:
- registration and management of staff users
- creation and management of multiple staff mobility cases
- upload, review, and archival of required documents
- officer review workflows
- reporting and CSV exports
- secure, searchable digital record keeping
- local-first deployment with easy later hosting

## Roles
- Staff
- Officer
- Admin

## Staff capabilities
- register with email and password
- log in securely
- wait for approval before full use
- edit profile:
  - first name
  - last name
  - email
  - academic title
  - faculty
  - department
- create multiple mobility cases
- save case drafts
- continue incomplete cases later
- submit cases
- view case status
- view officer comments
- upload required documents:
  - mobility agreement
  - final certificate of attendance
- see document review state
- see rejection reasons or correction comments
- download their own uploaded/current documents
- use a dashboard showing:
  - own cases
  - current status
  - missing documents
  - latest comments
  - open tasks

## Mobility case fields
- academic year
- mobility type: teaching or training
- host institution
- host country
- host city
- start date
- end date
- optional notes

## Officer capabilities
- view all mobility cases
- search cases
- filter by:
  - status
  - academic year
  - faculty
  - department
  - mobility type
  - country
  - host institution
- open case details
- review documents
- leave comments
- change case status
- mark missing or incorrect documents
- archive completed cases
- access reports and exports

## Admin capabilities
Includes all officer permissions plus:
- approve or reject registrations
- change user roles
- deactivate users
- manage master data:
  - faculties
  - departments
  - academic years
  - status lists
  - other select lists
- manage system settings:
  - allowed upload size
  - allowed file formats
  - storage paths
  - report display options

## Document requirements
- validate allowed file types
- validate max file size
- store original filename
- store upload timestamp
- preserve previous versions
- mark a current version
- support review status
- support review comments
- keep documents private
- make downloads available only after authorization checks

## Statuses
- draft
- submitted
- agreement uploaded
- under review
- approved
- mobility ongoing
- certificate uploaded
- completed
- changes required
- archived

## Search and filtering
The system must support:
- global case search
- search by name
- search by email
- search by institution
- search by country
- combined filters
- fast list views

## Reporting
The system must provide:
- mobility count by academic year
- by faculty
- by department
- by mobility type
- by host country
- by host institution
- by status
- open vs completed
- cases without mobility agreement
- cases without final certificate

## Export
At minimum:
- CSV for filtered case lists
- CSV for yearly summaries
- CSV for faculty summaries

## Auditability
Track at least:
- who created a case
- when a case was created
- when a document was uploaded
- who reviewed a document or case
- when a status changed
- which document version is current
- which comments were left

## Security
- only registered users access internal features
- staff only see their own cases
- officers see relevant cases
- admins have full rights
- passwords are stored securely
- sessions are managed securely
- files are not public
- downloads require authorization

## Validation
- required fields cannot be empty
- start date and end date must be logical
- mobility type must be valid
- upload files must be of allowed types
- upload files must not exceed max size
- error messages must be clear

## UX
- professional and institutional
- desktop-first
- mobile-clean
- clear forms
- readable tables
- strong status visibility
- serious, calm, structured, administrative

## Technical constraints
- fully runnable locally
- easy to move to hosted deployment later
- environment-variable based config
- no hardcoded local paths
- no cloud dependency required for local use
- proper database
- clean file storage abstraction

## Non-functional
- stable
- maintainable
- extensible
- reproducible locally
- no AI-like comments
- no fake completion states
- no placeholder final code