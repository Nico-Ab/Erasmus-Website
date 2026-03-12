import { UserApprovalStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DashboardPanelItem = {
  id: string;
  title: string;
  description: string;
  badge?: string;
  meta?: string;
};

type ActiveAcademicYearRecord = {
  label: string;
  startYear: number;
  endYear: number;
};

export type StaffDashboardData = {
  assignmentSummary: {
    faculty: string;
    department: string;
    academicTitle: string;
  };
  currentAcademicYearLabel: string | null;
  ownCasesCount: number;
  missingDocumentsCount: number;
  openTasksCount: number;
  statusAreas: DashboardPanelItem[];
  openTasks: DashboardPanelItem[];
  uploadPolicySummary: string;
};

export type ReviewDashboardData = {
  currentAcademicYearLabel: string | null;
  newRegistrationsCount: number;
  newSubmittedCasesCount: number;
  missingDocumentsCount: number;
  casesNeedingChangesCount: number;
  openReviewsCount: number;
  newRegistrations: DashboardPanelItem[];
  openReviews: DashboardPanelItem[];
  academicYearOverview: DashboardPanelItem[];
};

function formatDashboardDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);
}

function getCurrentAcademicYearLabel(years: ActiveAcademicYearRecord[]) {
  if (years.length === 0) {
    return null;
  }

  const now = new Date();
  const currentStartYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const matchingYear = years.find((year) => year.startYear === currentStartYear);

  return matchingYear?.label ?? years[0].label;
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

export async function getStaffDashboardData(userId: string): Promise<StaffDashboardData | null> {
  const [user, activeStatuses, activeAcademicYears, uploadSetting] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        academicTitleOption: {
          select: {
            label: true
          }
        },
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
    }),
    prisma.caseStatusDefinition.findMany({
      where: { isActive: true },
      select: {
        id: true,
        label: true
      },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      take: 5
    }),
    prisma.academicYear.findMany({
      where: { isActive: true },
      select: {
        label: true,
        startYear: true,
        endYear: true
      },
      orderBy: [{ sortOrder: "asc" }, { startYear: "asc" }]
    }),
    prisma.uploadSetting.findUnique({
      where: { id: "default" },
      select: {
        maxUploadSizeMb: true,
        allowedExtensions: true
      }
    })
  ]);

  if (!user) {
    return null;
  }

  const currentAcademicYearLabel = getCurrentAcademicYearLabel(activeAcademicYears);
  const openTasks: DashboardPanelItem[] = [];

  if (!user.academicTitleOption || !user.faculty || !user.department) {
    openTasks.push({
      id: "complete-profile",
      title: "Complete institutional profile",
      description:
        "Add or confirm your academic title, faculty, and department before case workflows begin using this data.",
      badge: "Action needed",
      meta: "/dashboard/profile"
    });
  }

  if (!currentAcademicYearLabel) {
    openTasks.push({
      id: "missing-academic-year",
      title: "Await academic year configuration",
      description:
        "No active academic year is configured yet, so new case work cannot be opened from the protected area.",
      badge: "Blocked",
      meta: "Admin setup required"
    });
  }

  const uploadPolicySummary = uploadSetting
    ? `${uploadSetting.maxUploadSizeMb} MB maximum, ${uploadSetting.allowedExtensions
        .split(",")
        .map((extension) => extension.trim().toUpperCase())
        .filter(Boolean)
        .join(", ")}`
    : "Upload policy not configured yet.";

  return {
    assignmentSummary: {
      faculty: user.faculty?.name ?? "Not assigned",
      department: user.department?.name ?? "Not assigned",
      academicTitle: user.academicTitleOption?.label ?? "Not assigned"
    },
    currentAcademicYearLabel,
    ownCasesCount: 0,
    missingDocumentsCount: 0,
    openTasksCount: openTasks.length,
    statusAreas: activeStatuses.map((status) => ({
      id: status.id,
      title: status.label,
      description: "No personal mobility cases are currently recorded in this status area.",
      badge: "0",
      meta: currentAcademicYearLabel ?? "No active academic year"
    })),
    openTasks,
    uploadPolicySummary
  };
}

export async function getReviewDashboardData(): Promise<ReviewDashboardData> {
  const [pendingRegistrations, activeAcademicYears, activeFacultyCount, activeDepartmentCount, activeStatusCount] =
    await Promise.all([
      prisma.user.findMany({
        where: {
          role: UserRole.STAFF,
          status: UserApprovalStatus.PENDING
        },
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          faculty: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 6
      }),
      prisma.academicYear.findMany({
        where: { isActive: true },
        select: {
          label: true,
          startYear: true,
          endYear: true
        },
        orderBy: [{ sortOrder: "asc" }, { startYear: "asc" }]
      }),
      prisma.faculty.count({
        where: { isActive: true }
      }),
      prisma.department.count({
        where: { isActive: true }
      }),
      prisma.caseStatusDefinition.count({
        where: { isActive: true }
      })
    ]);

  const currentAcademicYearLabel = getCurrentAcademicYearLabel(activeAcademicYears);
  const registrationItems = pendingRegistrations.map((registration) => ({
    id: registration.id,
    title: getUserDisplayName(registration),
    description: registration.faculty?.name
      ? `Pending staff registration from ${registration.faculty.name}.`
      : "Pending staff registration awaiting faculty assignment.",
    badge: "Pending",
    meta: `${registration.email} • ${formatDashboardDate(registration.createdAt)}`
  }));

  return {
    currentAcademicYearLabel,
    newRegistrationsCount: pendingRegistrations.length,
    newSubmittedCasesCount: 0,
    missingDocumentsCount: 0,
    casesNeedingChangesCount: 0,
    openReviewsCount: pendingRegistrations.length,
    newRegistrations: registrationItems,
    openReviews: registrationItems.map((registration) => ({
      ...registration,
      description:
        "Registration approval is the only live review queue today. Case reviews will appear here once that module is implemented.",
      badge: "Review"
    })),
    academicYearOverview: [
      {
        id: "current-academic-year",
        title: currentAcademicYearLabel ?? "Not configured",
        description: "Current academic year label used for protected workflows and reporting context.",
        meta: currentAcademicYearLabel ? "Current academic year" : "Admin setup required"
      },
      {
        id: "active-academic-years",
        title: activeAcademicYears.length.toString(),
        description: "Active academic year records currently available in master data.",
        meta: "Academic years"
      },
      {
        id: "active-faculties",
        title: activeFacultyCount.toString(),
        description: "Active faculties available for staff assignment and future filtering.",
        meta: "Faculties"
      },
      {
        id: "active-departments",
        title: activeDepartmentCount.toString(),
        description: "Active departments currently linked to the faculty master data.",
        meta: "Departments"
      },
      {
        id: "tracked-statuses",
        title: activeStatusCount.toString(),
        description: "Active workflow statuses prepared for the future case lifecycle.",
        meta: "Status records"
      }
    ]
  };
}