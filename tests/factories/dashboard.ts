import type { ReviewDashboardData, StaffDashboardData } from "@/lib/dashboard/service";

export function createStaffDashboardData(): StaffDashboardData {
  return {
    assignmentSummary: {
      faculty: "Faculty of Economics",
      department: "International Relations",
      academicTitle: "Dr."
    },
    currentAcademicYearLabel: "2025/2026",
    ownCasesCount: 2,
    draftCasesCount: 1,
    submittedCasesCount: 1,
    missingDocumentsCount: 0,
    openTasksCount: 1,
    cases: [
      {
        id: "case_1",
        academicYearLabel: "2025/2026",
        mobilityTypeLabel: "Teaching",
        hostInstitution: "University of Graz",
        hostLocation: "Graz, Austria",
        dateRangeLabel: "10 Apr 2026 - 15 Apr 2026",
        status: {
          key: "draft",
          label: "Draft"
        },
        updatedAtLabel: "12 Mar 2026",
        submittedAtLabel: null
      }
    ],
    statusAreas: [
      {
        id: "draft",
        title: "Draft",
        description: "1 personal mobility case currently sits in this status area.",
        badge: "1",
        meta: "2025/2026"
      },
      {
        id: "submitted",
        title: "Submitted",
        description: "1 personal mobility case currently sits in this status area.",
        badge: "1",
        meta: "2025/2026"
      }
    ],
    missingDocuments: [],
    latestComments: [
      {
        id: "comment_1",
        title: "University of Graz",
        description: "Please confirm the final agenda once available.",
        badge: "Officer Ivanov",
        meta: "12 Mar 2026"
      }
    ],
    openTasks: [
      {
        id: "draft-case",
        title: "University of Graz",
        description: "Draft case details remain editable. Complete the missing fields and submit the case when ready.",
        badge: "Draft",
        meta: "/dashboard/staff/cases/case_1"
      }
    ],
    uploadPolicySummary: "15 MB maximum, PDF, DOC, DOCX"
  };
}

export function createReviewDashboardData(): ReviewDashboardData {
  return {
    currentAcademicYearLabel: "2025/2026",
    newRegistrationsCount: 2,
    newSubmittedCasesCount: 1,
    missingDocumentsCount: 0,
    casesNeedingChangesCount: 1,
    openReviewsCount: 2,
    newRegistrations: [
      {
        id: "registration-1",
        title: "Pending Staff",
        description: "Pending staff registration from Faculty of Economics.",
        badge: "Pending",
        meta: "pending.staff@swu.local | 12 Mar 2026"
      }
    ],
    newSubmittedCases: [
      {
        id: "case-submitted-1",
        title: "University of Graz",
        description: "Elena Petrova submitted a teaching case for 2025/2026.",
        badge: "Submitted",
        meta: "12 Mar 2026"
      }
    ],
    missingDocuments: [],
    casesNeedingChanges: [
      {
        id: "case-change-1",
        title: "KU Leuven",
        description: "Elena Petrova has a case waiting on requested changes for 2025/2026.",
        badge: "Changes",
        meta: "13 Mar 2026"
      }
    ],
    openReviews: [
      {
        id: "case-submitted-1",
        title: "University of Graz",
        description: "Elena Petrova submitted a teaching case for 2025/2026.",
        badge: "Submitted",
        meta: "12 Mar 2026"
      },
      {
        id: "case-change-1",
        title: "KU Leuven",
        description: "Elena Petrova has a case waiting on requested changes for 2025/2026.",
        badge: "Changes",
        meta: "13 Mar 2026"
      }
    ],
    academicYearOverview: [
      {
        id: "current-year",
        title: "2025/2026",
        description:
          "Current academic year label used for protected workflows and reporting context.",
        meta: "Current academic year"
      },
      {
        id: "case-count",
        title: "4",
        description: "Mobility case records currently linked to the active academic year context.",
        meta: "Case records"
      }
    ]
  };
}