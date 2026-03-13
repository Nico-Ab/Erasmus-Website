import { beforeEach, describe, expect, it, vi } from "vitest";
import { getReportingData } from "@/lib/reporting/service";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    caseStatusDefinition: {
      findMany: vi.fn()
    },
    academicYear: {
      findMany: vi.fn()
    },
    faculty: {
      findMany: vi.fn()
    },
    department: {
      findMany: vi.fn()
    },
    selectOption: {
      findMany: vi.fn()
    },
    mobilityCase: {
      findMany: vi.fn()
    }
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

describe("reporting service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.caseStatusDefinition.findMany.mockResolvedValue([
      { id: "status_submitted", label: "Submitted", sortOrder: 1 },
      { id: "status_completed", label: "Completed", sortOrder: 2 },
      { id: "status_archived", label: "Archived", sortOrder: 3 }
    ]);
    prismaMock.academicYear.findMany.mockResolvedValue([
      { id: "year_2025", label: "2025/2026", sortOrder: 1, startYear: 2025 },
      { id: "year_2024", label: "2024/2025", sortOrder: 2, startYear: 2024 }
    ]);
    prismaMock.faculty.findMany.mockResolvedValue([
      { id: "faculty_science", name: "Faculty of Science" },
      { id: "faculty_law", name: "Faculty of Law" }
    ]);
    prismaMock.department.findMany.mockResolvedValue([
      { id: "department_chemistry", name: "Chemistry", facultyId: "faculty_science" },
      { id: "department_public_law", name: "Public Law", facultyId: "faculty_law" }
    ]);
    prismaMock.selectOption.findMany.mockResolvedValue([
      { id: "type_teaching", label: "Teaching", sortOrder: 1 },
      { id: "type_training", label: "Training", sortOrder: 2 }
    ]);
  });

  it("aggregates report metrics, summaries, and document gaps from filtered cases", async () => {
    prismaMock.mobilityCase.findMany.mockResolvedValue([
      {
        id: "case_1",
        hostInstitution: "University of Graz",
        hostCountry: "Austria",
        hostCity: "Graz",
        updatedAt: new Date("2026-03-10T00:00:00.000Z"),
        academicYear: { label: "2025/2026" },
        mobilityTypeOption: { label: "Teaching" },
        statusDefinition: { key: "submitted", label: "Submitted" },
        staffUser: {
          name: null,
          firstName: "Elena",
          lastName: "Petrova",
          email: "elena@swu.local",
          faculty: { name: "Faculty of Science" },
          department: { name: "Chemistry" }
        },
        documents: []
      },
      {
        id: "case_2",
        hostInstitution: "KU Leuven",
        hostCountry: "Belgium",
        hostCity: "Leuven",
        updatedAt: new Date("2026-03-11T00:00:00.000Z"),
        academicYear: { label: "2025/2026" },
        mobilityTypeOption: { label: "Training" },
        statusDefinition: { key: "completed", label: "Completed" },
        staffUser: {
          name: "Ivan Todorov",
          firstName: "Ivan",
          lastName: "Todorov",
          email: "ivan@swu.local",
          faculty: { name: "Faculty of Law" },
          department: { name: "Public Law" }
        },
        documents: [
          {
            currentVersionId: "version_1",
            documentTypeOption: { key: "mobility_agreement" }
          }
        ]
      },
      {
        id: "case_3",
        hostInstitution: "KU Leuven",
        hostCountry: "Belgium",
        hostCity: "Leuven",
        updatedAt: new Date("2026-03-12T00:00:00.000Z"),
        academicYear: { label: "2024/2025" },
        mobilityTypeOption: { label: "Training" },
        statusDefinition: { key: "archived", label: "Archived" },
        staffUser: {
          name: null,
          firstName: "Mira",
          lastName: "Ivanova",
          email: "mira@swu.local",
          faculty: { name: "Faculty of Law" },
          department: { name: "Public Law" }
        },
        documents: [
          {
            currentVersionId: "version_2",
            documentTypeOption: { key: "mobility_agreement" }
          },
          {
            currentVersionId: "version_3",
            documentTypeOption: { key: "certificate_of_attendance" }
          }
        ]
      }
    ]);

    const data = await getReportingData({
      academicYearId: "year_2025",
      facultyId: "",
      departmentId: "",
      mobilityTypeOptionId: "",
      country: "Belgium",
      hostInstitution: "KU",
      statusDefinitionId: ""
    });

    expect(prismaMock.mobilityCase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              academicYearId: "year_2025"
            },
            {
              hostCountry: {
                contains: "Belgium",
                mode: "insensitive"
              }
            },
            {
              hostInstitution: {
                contains: "KU",
                mode: "insensitive"
              }
            }
          ]
        }
      })
    );
    expect(data.metrics).toEqual({
      totalCount: 3,
      openCount: 1,
      completedCount: 2,
      archivedCount: 1,
      missingMobilityAgreementCount: 1,
      missingFinalCertificateCount: 2
    });
    expect(data.summaries.byFaculty).toEqual([
      {
        label: "Faculty of Science",
        totalCount: 1,
        openCount: 1,
        completedCount: 0,
        missingMobilityAgreementCount: 1,
        missingFinalCertificateCount: 1
      },
      {
        label: "Faculty of Law",
        totalCount: 2,
        openCount: 0,
        completedCount: 2,
        missingMobilityAgreementCount: 0,
        missingFinalCertificateCount: 1
      }
    ]);
    expect(data.summaries.byStatus).toEqual([
      {
        label: "Submitted",
        totalCount: 1,
        openCount: 1,
        completedCount: 0,
        missingMobilityAgreementCount: 1,
        missingFinalCertificateCount: 1
      },
      {
        label: "Completed",
        totalCount: 1,
        openCount: 0,
        completedCount: 1,
        missingMobilityAgreementCount: 0,
        missingFinalCertificateCount: 1
      },
      {
        label: "Archived",
        totalCount: 1,
        openCount: 0,
        completedCount: 1,
        missingMobilityAgreementCount: 0,
        missingFinalCertificateCount: 0
      }
    ]);
    expect(data.summaries.byHostInstitution[0]).toEqual({
      label: "KU Leuven",
      totalCount: 2,
      openCount: 0,
      completedCount: 2,
      missingMobilityAgreementCount: 0,
      missingFinalCertificateCount: 1
    });
    expect(data.summaries.documentGaps).toEqual([
      {
        key: "mobility_agreement",
        label: "Cases without mobility agreement",
        count: 1
      },
      {
        key: "certificate_of_attendance",
        label: "Cases without final certificate",
        count: 2
      }
    ]);
  });
});