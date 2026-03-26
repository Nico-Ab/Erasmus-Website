import { describe, expect, it } from "vitest";
import {
  buildFacultySummaryCsv,
  buildFilteredCaseListCsv,
  buildYearlySummaryCsv
} from "@/lib/reporting/csv";
import { createCsvDownloadResponse } from "@/lib/reporting/download";

describe("reporting csv", () => {
  it("builds a filtered case-list csv with escaped institution names and document flags", () => {
    const csv = buildFilteredCaseListCsv([
      {
        id: "case_1",
        staffName: "Elena Petrova",
        staffEmail: "elena@swu.local",
        facultyName: "Faculty of Mathematics and Natural Sciences",
        departmentName: "Chemistry",
        academicYearLabel: "2025/2026",
        mobilityTypeLabel: "Teaching",
        hostInstitution: 'University of "Applied" Sciences',
        hostCountry: "Austria",
        hostCity: "Graz",
        status: {
          key: "submitted",
          label: "Submitted"
        },
        workflowStateLabel: "Open",
        missingMobilityAgreement: true,
        missingFinalCertificate: false,
        missingDocumentsSummary: "Mobility agreement",
        updatedAtLabel: "10 Mar 2026"
      }
    ]);

    expect(csv).toContain("Case ID,Staff name,Staff email");
    expect(csv).toContain('"University of ""Applied"" Sciences"');
    expect(csv).toContain(",Yes,No,Mobility agreement,10 Mar 2026\n");
  });

  it("builds yearly and faculty summary csv files with the expected headers", () => {
    const summaryRows = [
      {
        label: "2025/2026",
        totalCount: 4,
        openCount: 2,
        completedCount: 2,
        missingMobilityAgreementCount: 1,
        missingFinalCertificateCount: 3
      }
    ];

    expect(buildYearlySummaryCsv(summaryRows)).toContain(
      "Academic year,Total cases,Open cases,Completed or archived cases,Cases without mobility agreement,Cases without final certificate"
    );
    expect(buildFacultySummaryCsv([
      {
        label: "Faculty of Law and History",
        totalCount: 2,
        openCount: 1,
        completedCount: 1,
        missingMobilityAgreementCount: 0,
        missingFinalCertificateCount: 1
      }
    ])).toContain("Faculty,Total cases,Open cases,Completed or archived cases");
  });

  it("neutralizes spreadsheet formulas in exported text fields", () => {
    const csv = buildFilteredCaseListCsv([
      {
        id: "case_2",
        staffName: "=cmd|' /C calc'!A0",
        staffEmail: "danger@swu.local",
        facultyName: "Faculty of Economics",
        departmentName: "International Relations",
        academicYearLabel: "2025/2026",
        mobilityTypeLabel: "Teaching",
        hostInstitution: "+SUM(1,1)",
        hostCountry: "Bulgaria",
        hostCity: "Blagoevgrad",
        status: {
          key: "submitted",
          label: "Submitted"
        },
        workflowStateLabel: "Open",
        missingMobilityAgreement: false,
        missingFinalCertificate: true,
        missingDocumentsSummary: "Final certificate",
        updatedAtLabel: "11 Mar 2026"
      }
    ]);

    expect(csv).toContain("'=cmd|' /C calc'!A0");
    expect(csv).toContain("'+SUM(1,1)");
  });

  it("sets private no-sniff headers on csv downloads", () => {
    const response = createCsvDownloadResponse("cases", "id\ncase_1\n");

    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
  });
});
