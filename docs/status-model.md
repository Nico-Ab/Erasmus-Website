# Status Model

## Case statuses
- draft
- submitted
- agreement_uploaded
- under_review
- approved
- mobility_ongoing
- certificate_uploaded
- completed
- changes_required
- archived

## Meaning
- draft: created by staff but not submitted
- submitted: staff submitted case for review
- agreement_uploaded: required agreement is present
- under_review: officer is reviewing case or documents
- approved: case approved for progression
- mobility_ongoing: the mobility is currently taking place
- certificate_uploaded: final certificate has been uploaded
- completed: the case is complete
- changes_required: officer requested corrections
- archived: case is closed but still searchable and exportable

## Rules
- archived cases remain searchable
- archived cases remain exportable
- staff should still be able to view their archived cases
- document review state and case status are related but not identical
- document rejection should not silently overwrite case status history