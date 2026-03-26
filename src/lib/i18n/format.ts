import { DocumentReviewState } from "@prisma/client";
import { getDateLocale, type AppLocale } from "@/lib/i18n/config";

const roleLabels = {
  en: {
    STAFF: "Staff",
    OFFICER: "Officer",
    ADMIN: "Admin"
  },
  bg: {
    STAFF: "Staff",
    OFFICER: "Officer",
    ADMIN: "Admin"
  }
} as const;

const approvalStatusLabels = {
  en: {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    DEACTIVATED: "Deactivated"
  },
  bg: {
    PENDING: "Изчаква",
    APPROVED: "Одобрен",
    REJECTED: "Отхвърлен",
    DEACTIVATED: "Деактивиран"
  }
} as const;

const caseStatusLabels = {
  en: {
    draft: "Draft",
    submitted: "Submitted",
    agreement_uploaded: "Agreement uploaded",
    under_review: "Under review",
    approved: "Approved",
    mobility_ongoing: "Mobility ongoing",
    certificate_uploaded: "Certificate uploaded",
    completed: "Completed",
    changes_required: "Changes required",
    archived: "Archived"
  },
  bg: {
    draft: "Чернова",
    submitted: "Подаден",
    agreement_uploaded: "Качено споразумение",
    under_review: "В преглед",
    approved: "Одобрен",
    mobility_ongoing: "Мобилността е в ход",
    certificate_uploaded: "Качено удостоверение",
    completed: "Завършен",
    changes_required: "Изискват се корекции",
    archived: "Архивиран"
  }
} as const;

const documentReviewLabels = {
  en: {
    [DocumentReviewState.PENDING_REVIEW]: "Pending review",
    [DocumentReviewState.ACCEPTED]: "Accepted",
    [DocumentReviewState.REJECTED]: "Rejected",
    NOT_UPLOADED: "Not uploaded"
  },
  bg: {
    [DocumentReviewState.PENDING_REVIEW]: "Очаква преглед",
    [DocumentReviewState.ACCEPTED]: "Приет",
    [DocumentReviewState.REJECTED]: "Отхвърлен",
    NOT_UPLOADED: "Не е качен"
  }
} as const;

export function formatRoleLabel(role: string, locale: AppLocale = "en") {
  return roleLabels[locale][role as keyof (typeof roleLabels)[typeof locale]] ?? role;
}

export function formatApprovalStatusLabel(value: string, locale: AppLocale = "en") {
  return approvalStatusLabels[locale][value as keyof (typeof approvalStatusLabels)[typeof locale]] ?? value;
}

export function formatCaseStatusLabel(statusKey: string, fallbackLabel: string, locale: AppLocale = "en") {
  return caseStatusLabels[locale][statusKey as keyof (typeof caseStatusLabels)[typeof locale]] ?? fallbackLabel;
}

export function formatDocumentReviewLabel(
  reviewStateKey: string,
  fallbackLabel: string,
  locale: AppLocale = "en"
) {
  return (
    documentReviewLabels[locale][reviewStateKey as keyof (typeof documentReviewLabels)[typeof locale]] ??
    fallbackLabel
  );
}

export function formatStatusLabel(value: string, locale: AppLocale = "en") {
  if (value in approvalStatusLabels[locale]) {
    return formatApprovalStatusLabel(value, locale);
  }

  if (value in caseStatusLabels[locale]) {
    return formatCaseStatusLabel(value, value, locale);
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDate(value: Date, locale: AppLocale = "en") {
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

export function formatDateTime(value: Date, locale: AppLocale = "en") {
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(value);
}
