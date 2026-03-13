import { requiredDocumentTypeKeys } from "@/lib/documents/constants";
import { prisma } from "@/lib/prisma";
import { ensureReportSetting } from "@/lib/reporting/settings";
import {
  buildReportingCaseWhere,
  type ReportingFiltersInput
} from "@/lib/reporting/filters";

const completedStatusKeys = new Set(["completed", "archived"]);

type CaseDocumentReference = {
  currentVersionId: string | null;
  documentTypeOption: {
    key: string;
  };
};

type ReportingCaseRecord = {
  id: string;
  hostInstitution: string | null;
  hostCountry: string | null;
  hostCity: string | null;
  updatedAt: Date;
  academicYear: {
    label: string;
  } | null;
  mobilityTypeOption: {
    label: string;
  } | null;
  statusDefinition: {
    key: string;
    label: string;
  };
  staffUser: {
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
    faculty: {
      name: string;
    } | null;
    department: {
      name: string;
    } | null;
  };
  documents: CaseDocumentReference[];
};

export type ReportingCaseListItem = {
  id: string;
  staffName: string;
  staffEmail: string;
  facultyName: string;
  departmentName: string;
  academicYearLabel: string;
  mobilityTypeLabel: string;
  hostInstitution: string;
  hostCountry: string;
  hostCity: string;
  status: {
    key: string;
    label: string;
  };
  workflowStateLabel: string;
  missingMobilityAgreement: boolean;
  missingFinalCertificate: boolean;
  missingDocumentsSummary: string;
  updatedAtLabel: string;
};

export type ReportingSummaryRow = {
  label: string;
  totalCount: number;
  openCount: number;
  completedCount: number;
  missingMobilityAgreementCount: number;
  missingFinalCertificateCount: number;
};

export type ReportingDocumentGapRow = {
  key: string;
  label: string;
  count: number;
};

export type ReportingData = {
  filters: ReportingFiltersInput;
  displaySettings: {
    summaryRowLimit: number;
    showHostInstitutionSummary: boolean;
    showDocumentGapSummary: boolean;
  };
  filterOptions: {
    statuses: Array<{ id: string; label: string }>;
    academicYears: Array<{ id: string; label: string }>;
    faculties: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string; facultyId: string }>;
    mobilityTypes: Array<{ id: string; label: string }>;
  };
  metrics: {
    totalCount: number;
    openCount: number;
    completedCount: number;
    archivedCount: number;
    missingMobilityAgreementCount: number;
    missingFinalCertificateCount: number;
  };
  caseList: ReportingCaseListItem[];
  summaries: {
    byAcademicYear: ReportingSummaryRow[];
    byFaculty: ReportingSummaryRow[];
    byDepartment: ReportingSummaryRow[];
    byMobilityType: ReportingSummaryRow[];
    byHostCountry: ReportingSummaryRow[];
    byHostInstitution: ReportingSummaryRow[];
    byStatus: ReportingSummaryRow[];
    documentGaps: ReportingDocumentGapRow[];
  };
};

function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

function getUserDisplayName(user: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const trimmedName = user.name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  const composedName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return composedName || user.email;
}

function normalizeText(value: string | null | undefined, fallback: string) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : fallback;
}

function hasCurrentDocument(documents: CaseDocumentReference[], documentTypeKey: string) {
  return documents.some(
    (document) =>
      document.currentVersionId && document.documentTypeOption.key === documentTypeKey
  );
}

function buildMissingDocumentsSummary(
  missingMobilityAgreement: boolean,
  missingFinalCertificate: boolean
) {
  const missing: string[] = [];

  if (missingMobilityAgreement) {
    missing.push("Mobility agreement");
  }

  if (missingFinalCertificate) {
    missing.push("Final certificate");
  }

  return missing.length > 0 ? missing.join(" | ") : "All required current documents are on file.";
}

function buildCaseListItem(mobilityCase: ReportingCaseRecord): ReportingCaseListItem {
  const missingMobilityAgreement = !hasCurrentDocument(
    mobilityCase.documents,
    requiredDocumentTypeKeys.mobilityAgreement
  );
  const missingFinalCertificate = !hasCurrentDocument(
    mobilityCase.documents,
    requiredDocumentTypeKeys.finalCertificateOfAttendance
  );
  const isCompleted = completedStatusKeys.has(mobilityCase.statusDefinition.key);

  return {
    id: mobilityCase.id,
    staffName: getUserDisplayName(mobilityCase.staffUser),
    staffEmail: mobilityCase.staffUser.email,
    facultyName: mobilityCase.staffUser.faculty?.name ?? "Not assigned",
    departmentName: mobilityCase.staffUser.department?.name ?? "Not assigned",
    academicYearLabel: mobilityCase.academicYear?.label ?? "Not set",
    mobilityTypeLabel: mobilityCase.mobilityTypeOption?.label ?? "Not set",
    hostInstitution: normalizeText(mobilityCase.hostInstitution, "Host institution not set"),
    hostCountry: normalizeText(mobilityCase.hostCountry, "Country not set"),
    hostCity: normalizeText(mobilityCase.hostCity, "City not set"),
    status: {
      key: mobilityCase.statusDefinition.key,
      label: mobilityCase.statusDefinition.label
    },
    workflowStateLabel: isCompleted ? "Completed" : "Open",
    missingMobilityAgreement,
    missingFinalCertificate,
    missingDocumentsSummary: buildMissingDocumentsSummary(
      missingMobilityAgreement,
      missingFinalCertificate
    ),
    updatedAtLabel: formatDateLabel(mobilityCase.updatedAt)
  };
}

function buildSummaryRows(
  caseList: ReportingCaseListItem[],
  getLabel: (item: ReportingCaseListItem) => string,
  compareRows: (left: ReportingSummaryRow, right: ReportingSummaryRow) => number
) {
  const rowsByLabel = new Map<string, ReportingSummaryRow>();

  for (const item of caseList) {
    const label = getLabel(item);
    const row =
      rowsByLabel.get(label) ??
      {
        label,
        totalCount: 0,
        openCount: 0,
        completedCount: 0,
        missingMobilityAgreementCount: 0,
        missingFinalCertificateCount: 0
      };

    row.totalCount += 1;

    if (item.workflowStateLabel === "Open") {
      row.openCount += 1;
    } else {
      row.completedCount += 1;
    }

    if (item.missingMobilityAgreement) {
      row.missingMobilityAgreementCount += 1;
    }

    if (item.missingFinalCertificate) {
      row.missingFinalCertificateCount += 1;
    }

    rowsByLabel.set(label, row);
  }

  return Array.from(rowsByLabel.values()).sort(compareRows);
}

function compareByLabel(left: ReportingSummaryRow, right: ReportingSummaryRow) {
  return left.label.localeCompare(right.label, "en");
}

function compareByCountThenLabel(left: ReportingSummaryRow, right: ReportingSummaryRow) {
  if (right.totalCount !== left.totalCount) {
    return right.totalCount - left.totalCount;
  }

  return compareByLabel(left, right);
}

function buildLookupSortOrder(items: Array<{ label: string }>) {
  return new Map(items.map((item, index) => [item.label, index]));
}

function compareByLookupThenLabel(sortOrderByLabel: Map<string, number>) {
  return (left: ReportingSummaryRow, right: ReportingSummaryRow) => {
    const leftOrder = sortOrderByLabel.get(left.label) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = sortOrderByLabel.get(right.label) ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return compareByLabel(left, right);
  };
}

export async function getReportingData(
  filters: ReportingFiltersInput
): Promise<ReportingData> {
  const where = buildReportingCaseWhere(filters);
  const [statuses, academicYears, faculties, departments, mobilityTypes, mobilityCases, reportSetting] =
    await Promise.all([
      prisma.caseStatusDefinition.findMany({
        where: { isActive: true },
        select: {
          id: true,
          label: true,
          sortOrder: true
        },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
      }),
      prisma.academicYear.findMany({
        where: { isActive: true },
        select: {
          id: true,
          label: true,
          sortOrder: true,
          startYear: true
        },
        orderBy: [{ sortOrder: "asc" }, { startYear: "asc" }]
      }),
      prisma.faculty.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true
        },
        orderBy: { name: "asc" }
      }),
      prisma.department.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          facultyId: true
        },
        orderBy: { name: "asc" }
      }),
      prisma.selectOption.findMany({
        where: {
          category: "MOBILITY_TYPE",
          isActive: true
        },
        select: {
          id: true,
          label: true,
          sortOrder: true
        },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
      }),
      prisma.mobilityCase.findMany({
        where,
        select: {
          id: true,
          hostInstitution: true,
          hostCountry: true,
          hostCity: true,
          updatedAt: true,
          academicYear: {
            select: {
              label: true
            }
          },
          mobilityTypeOption: {
            select: {
              label: true
            }
          },
          statusDefinition: {
            select: {
              key: true,
              label: true
            }
          },
          staffUser: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              faculty: {
                select: {
                  name: true
                }
              },
              department: {
                select: {
                  name: true
                }
              }
            }
          },
          documents: {
            select: {
              currentVersionId: true,
              documentTypeOption: {
                select: {
                  key: true
                }
              }
            }
          }
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
      }),
      ensureReportSetting()
    ]);

  const caseList = mobilityCases.map(buildCaseListItem);
  const statusSortOrder = buildLookupSortOrder(statuses);
  const academicYearSortOrder = buildLookupSortOrder(academicYears);
  const facultySortOrder = buildLookupSortOrder(
    faculties.map((faculty) => ({ label: faculty.name }))
  );
  const departmentSortOrder = buildLookupSortOrder(
    departments.map((department) => ({ label: department.name }))
  );
  const mobilityTypeSortOrder = buildLookupSortOrder(mobilityTypes);
  const totalCount = caseList.length;
  const openCount = caseList.filter((item) => item.workflowStateLabel === "Open").length;
  const completedCount = totalCount - openCount;
  const archivedCount = caseList.filter((item) => item.status.key === "archived").length;
  const missingMobilityAgreementCount = caseList.filter(
    (item) => item.missingMobilityAgreement
  ).length;
  const missingFinalCertificateCount = caseList.filter(
    (item) => item.missingFinalCertificate
  ).length;

  return {
    filters,
    displaySettings: {
      summaryRowLimit: reportSetting.summaryRowLimit,
      showHostInstitutionSummary: reportSetting.showHostInstitutionSummary,
      showDocumentGapSummary: reportSetting.showDocumentGapSummary
    },
    filterOptions: {
      statuses: statuses.map((status) => ({
        id: status.id,
        label: status.label
      })),
      academicYears: academicYears.map((academicYear) => ({
        id: academicYear.id,
        label: academicYear.label
      })),
      faculties,
      departments,
      mobilityTypes: mobilityTypes.map((mobilityType) => ({
        id: mobilityType.id,
        label: mobilityType.label
      }))
    },
    metrics: {
      totalCount,
      openCount,
      completedCount,
      archivedCount,
      missingMobilityAgreementCount,
      missingFinalCertificateCount
    },
    caseList,
    summaries: {
      byAcademicYear: buildSummaryRows(
        caseList,
        (item) => item.academicYearLabel,
        compareByLookupThenLabel(academicYearSortOrder)
      ),
      byFaculty: buildSummaryRows(
        caseList,
        (item) => item.facultyName,
        compareByLookupThenLabel(facultySortOrder)
      ),
      byDepartment: buildSummaryRows(
        caseList,
        (item) => item.departmentName,
        compareByLookupThenLabel(departmentSortOrder)
      ),
      byMobilityType: buildSummaryRows(
        caseList,
        (item) => item.mobilityTypeLabel,
        compareByLookupThenLabel(mobilityTypeSortOrder)
      ),
      byHostCountry: buildSummaryRows(
        caseList,
        (item) => item.hostCountry,
        compareByCountThenLabel
      ),
      byHostInstitution: buildSummaryRows(
        caseList,
        (item) => item.hostInstitution,
        compareByCountThenLabel
      ),
      byStatus: buildSummaryRows(
        caseList,
        (item) => item.status.label,
        compareByLookupThenLabel(statusSortOrder)
      ),
      documentGaps: [
        {
          key: requiredDocumentTypeKeys.mobilityAgreement,
          label: "Cases without mobility agreement",
          count: missingMobilityAgreementCount
        },
        {
          key: requiredDocumentTypeKeys.finalCertificateOfAttendance,
          label: "Cases without final certificate",
          count: missingFinalCertificateCount
        }
      ]
    }
  };
}