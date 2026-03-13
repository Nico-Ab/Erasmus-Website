import type {
  ReportingCaseListItem,
  ReportingSummaryRow
} from "@/lib/reporting/service";

type CsvCell = string | number | boolean;

function escapeCsvCell(value: CsvCell) {
  const normalizedValue = typeof value === "boolean" ? (value ? "Yes" : "No") : `${value}`;

  if (/[",\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replaceAll('"', '""')}"`;
  }

  return normalizedValue;
}

function buildCsvContent(headers: string[], rows: CsvCell[][]) {
  const lines = [headers.map(escapeCsvCell).join(",")];

  for (const row of rows) {
    lines.push(row.map(escapeCsvCell).join(","));
  }

  return `${lines.join("\n")}\n`;
}

function buildSummaryCsv(groupLabel: string, rows: ReportingSummaryRow[]) {
  return buildCsvContent(
    [
      groupLabel,
      "Total cases",
      "Open cases",
      "Completed or archived cases",
      "Cases without mobility agreement",
      "Cases without final certificate"
    ],
    rows.map((row) => [
      row.label,
      row.totalCount,
      row.openCount,
      row.completedCount,
      row.missingMobilityAgreementCount,
      row.missingFinalCertificateCount
    ])
  );
}

export function buildFilteredCaseListCsv(rows: ReportingCaseListItem[]) {
  return buildCsvContent(
    [
      "Case ID",
      "Staff name",
      "Staff email",
      "Faculty",
      "Department",
      "Academic year",
      "Mobility type",
      "Host institution",
      "Host country",
      "Host city",
      "Status",
      "Workflow state",
      "Missing mobility agreement",
      "Missing final certificate",
      "Missing documents",
      "Updated"
    ],
    rows.map((row) => [
      row.id,
      row.staffName,
      row.staffEmail,
      row.facultyName,
      row.departmentName,
      row.academicYearLabel,
      row.mobilityTypeLabel,
      row.hostInstitution,
      row.hostCountry,
      row.hostCity,
      row.status.label,
      row.workflowStateLabel,
      row.missingMobilityAgreement,
      row.missingFinalCertificate,
      row.missingDocumentsSummary,
      row.updatedAtLabel
    ])
  );
}

export function buildYearlySummaryCsv(rows: ReportingSummaryRow[]) {
  return buildSummaryCsv("Academic year", rows);
}

export function buildFacultySummaryCsv(rows: ReportingSummaryRow[]) {
  return buildSummaryCsv("Faculty", rows);
}