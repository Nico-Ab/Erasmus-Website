import type { ReviewDashboardData, StaffDashboardData } from "@/lib/dashboard/service";

export function createStaffDashboardData(): StaffDashboardData {
  return {
    assignmentSummary: {
      faculty: "Faculty of Economics",
      department: "International Relations",
      academicTitle: "Dr."
    },
    currentAcademicYearLabel: "2025/2026",
    ownCasesCount: 0,
    missingDocumentsCount: 0,
    openTasksCount: 1,
    statusAreas: [
      {
        id: "draft",
        title: "Draft",
        description: "No personal mobility cases are currently recorded in this status area.",
        badge: "0",
        meta: "2025/2026"
      },
      {
        id: "submitted",
        title: "Submitted",
        description: "No personal mobility cases are currently recorded in this status area.",
        badge: "0",
        meta: "2025/2026"
      }
    ],
    openTasks: [
      {
        id: "complete-profile",
        title: "Complete institutional profile",
        description:
          "Add or confirm your academic title, faculty, and department before case workflows begin using this data.",
        badge: "Action needed",
        meta: "/dashboard/profile"
      }
    ],
    uploadPolicySummary: "15 MB maximum, PDF, DOC, DOCX"
  };
}

export function createReviewDashboardData(): ReviewDashboardData {
  return {
    currentAcademicYearLabel: "2025/2026",
    newRegistrationsCount: 2,
    newSubmittedCasesCount: 0,
    missingDocumentsCount: 0,
    casesNeedingChangesCount: 0,
    openReviewsCount: 2,
    newRegistrations: [
      {
        id: "registration-1",
        title: "Pending Staff",
        description: "Pending staff registration from Faculty of Economics.",
        badge: "Pending",
        meta: "pending.staff@swu.local • 12 Mar 2026"
      }
    ],
    openReviews: [
      {
        id: "review-1",
        title: "Pending Staff",
        description:
          "Registration approval is the only live review queue today. Case reviews will appear here once that module is implemented.",
        badge: "Review",
        meta: "pending.staff@swu.local • 12 Mar 2026"
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
        id: "active-faculties",
        title: "3",
        description: "Active faculties available for staff assignment and future filtering.",
        meta: "Faculties"
      }
    ]
  };
}