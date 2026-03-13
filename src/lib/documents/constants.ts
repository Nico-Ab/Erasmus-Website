export const requiredDocumentTypeDefinitions = [
  {
    key: "mobility_agreement",
    label: "Mobility Agreement",
    uploadHint: "Upload the signed mobility agreement before review proceeds."
  },
  {
    key: "certificate_of_attendance",
    label: "Final Certificate of Attendance",
    uploadHint: "Upload the final certificate after the mobility period is completed."
  }
] as const;

export const requiredDocumentTypeKeys = {
  mobilityAgreement: requiredDocumentTypeDefinitions[0].key,
  finalCertificateOfAttendance: requiredDocumentTypeDefinitions[1].key
} as const;

export const documentReviewStateLabels = {
  PENDING_REVIEW: "Pending review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected"
} as const;

export const blockedDocumentUploadStatusKeys = new Set(["draft", "archived", "completed"]);

export const documentUploadStatusKeyByType = {
  [requiredDocumentTypeKeys.mobilityAgreement]: "agreement_uploaded",
  [requiredDocumentTypeKeys.finalCertificateOfAttendance]: "certificate_uploaded"
} as const;

export type RequiredDocumentTypeKey = (typeof requiredDocumentTypeDefinitions)[number]["key"];