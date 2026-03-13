import { formatStatusLabel } from "@/lib/utils";

export const auditEntityTypes = {
  user: "USER",
  mobilityCase: "MOBILITY_CASE",
  document: "DOCUMENT",
  documentVersion: "DOCUMENT_VERSION",
  comment: "COMMENT",
  masterData: "MASTER_DATA",
  uploadSetting: "UPLOAD_SETTING",
  reportSetting: "REPORT_SETTING"
} as const;

export const auditActionTypes = {
  userRegistered: "USER_REGISTERED",
  userApproved: "USER_APPROVED",
  userRejected: "USER_REJECTED",
  userRoleChanged: "USER_ROLE_CHANGED",
  userDeactivated: "USER_DEACTIVATED",
  caseCreated: "CASE_CREATED",
  caseUpdated: "CASE_UPDATED",
  caseSubmitted: "CASE_SUBMITTED",
  caseStatusChanged: "CASE_STATUS_CHANGED",
  caseCommentAdded: "CASE_COMMENT_ADDED",
  documentUploaded: "DOCUMENT_UPLOADED",
  documentCurrentVersionChanged: "DOCUMENT_CURRENT_VERSION_CHANGED",
  documentReviewed: "DOCUMENT_REVIEWED",
  documentMarkedMissing: "DOCUMENT_MARKED_MISSING",
  masterDataCreated: "MASTER_DATA_CREATED",
  masterDataUpdated: "MASTER_DATA_UPDATED",
  uploadSettingUpdated: "UPLOAD_SETTING_UPDATED",
  reportSettingUpdated: "REPORT_SETTING_UPDATED"
} as const;

export function formatAuditActionLabel(value: string) {
  return formatStatusLabel(value);
}

export function formatAuditEntityLabel(value: string) {
  return formatStatusLabel(value);
}