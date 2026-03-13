import { UserApprovalStatus, UserRole } from "@prisma/client";
import { requiredDocumentTypeDefinitions } from "@/lib/documents/constants";
import { prisma } from "@/lib/prisma";

type ActiveAcademicYearRecord = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
};

type CaseDocumentReference = {
  currentVersionId: string | null;
  documentTypeOption: {
    key: string;
    label: string;
  };
};

export type DashboardPanelItem = {
  id: string;
  title: string;
  description: string;
  badge?: string;
  meta?: string;
};

export type StaffDashboardData = {
  assignmentSummary: {
    faculty: string;
    department: string;
    academicTitle: string;
  };
  currentAcademicYearLabel: string | null;
  ownCasesCount: number;
  draftCasesCount: number;
  submittedCasesCount: number;
  missingDocumentsCount: number;
  openTasksCount: number;
  cases: Array<{
    id: string;
    academicYearLabel: string | null;
    mobilityTypeLabel: string | null;
    hostInstitution: string;
    hostLocation: string;
    dateRangeLabel: string;
    status: {
      key: string;
      label: string;
    };
    updatedAtLabel: string;
    submittedAtLabel: string | null;
  }>;
  statusAreas: DashboardPanelItem[];
  missingDocuments: DashboardPanelItem[];
  latestComments: DashboardPanelItem[];
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
  newSubmittedCases: DashboardPanelItem[];
  missingDocuments: DashboardPanelItem[];
  casesNeedingChanges: DashboardPanelItem[];
  openReviews: DashboardPanelItem[];
  academicYearOverview: DashboardPanelItem[];
};

function formatDashboardDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

function formatDateRangeLabel(startDate: Date | null, endDate: Date | null) {
  if (startDate && endDate) {
    return `${formatDashboardDate(startDate)} - ${formatDashboardDate(endDate)}`;
  }

  if (startDate) {
    return `Starts ${formatDashboardDate(startDate)}`;
  }

  if (endDate) {
    return `Ends ${formatDashboardDate(endDate)}`;
  }

  return "Dates not set";
}

function formatCaseLocation(hostCity: string | null, hostCountry: string | null) {
  return [hostCity, hostCountry].filter(Boolean).join(", ") || "Location not set";
}

function getCurrentAcademicYear(years: ActiveAcademicYearRecord[]) {
  if (years.length === 0) {
    return null;
  }

  const now = new Date();
  const currentStartYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const matchingYear = years.find((year) => year.startYear === currentStartYear);

  return matchingYear ?? years[0];
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

function buildCaseReviewTitle(mobilityCase: {
  hostInstitution: string | null;
  academicYear: {
    label: string;
  } | null;
  mobilityTypeOption: {
    label: string;
  } | null;
}) {
  const hostInstitution = mobilityCase.hostInstitution?.trim();

  if (hostInstitution) {
    return hostInstitution;
  }

  return mobilityCase.academicYear?.label ?? mobilityCase.mobilityTypeOption?.label ?? "Mobility case";
}

function shouldTrackMissingDocuments(statusKey: string) {
  return !["draft", "archived", "completed"].includes(statusKey);
}

function getMissingRequiredDocuments(documents: CaseDocumentReference[]) {
  const currentDocumentKeys = new Set(
    documents.filter((document) => Boolean(document.currentVersionId)).map((document) => document.documentTypeOption.key)
  );

  return requiredDocumentTypeDefinitions.filter((definition) => !currentDocumentKeys.has(definition.key));
}

export async function getStaffDashboardData(userId: string): Promise<StaffDashboardData | null> {
  const [user, activeStatuses, activeAcademicYears, uploadSetting, mobilityCases, latestComments] =
    await Promise.all([
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
          key: true,
          label: true
        },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        take: 10
      }),
      prisma.academicYear.findMany({
        where: { isActive: true },
        select: {
          id: true,
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
      }),
      prisma.mobilityCase.findMany({
        where: { staffUserId: userId },
        select: {
          id: true,
          hostInstitution: true,
          hostCountry: true,
          hostCity: true,
          startDate: true,
          endDate: true,
          updatedAt: true,
          submittedAt: true,
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
              id: true,
              key: true,
              label: true
            }
          },
          documents: {
            select: {
              currentVersionId: true,
              documentTypeOption: {
                select: {
                  key: true,
                  label: true
                }
              }
            }
          }
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
      }),
      prisma.mobilityCaseComment.findMany({
        where: {
          mobilityCase: {
            staffUserId: userId
          }
        },
        select: {
          id: true,
          body: true,
          createdAt: true,
          mobilityCase: {
            select: {
              id: true,
              hostInstitution: true
            }
          },
          authorUser: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);

  if (!user) {
    return null;
  }

  const currentAcademicYear = getCurrentAcademicYear(activeAcademicYears);
  const currentAcademicYearLabel = currentAcademicYear?.label ?? null;
  const caseCountByStatusId = new Map<string, number>();

  for (const mobilityCase of mobilityCases) {
    caseCountByStatusId.set(
      mobilityCase.statusDefinition.id,
      (caseCountByStatusId.get(mobilityCase.statusDefinition.id) ?? 0) + 1
    );
  }

  const draftCases = mobilityCases.filter((mobilityCase) => mobilityCase.statusDefinition.key === "draft");
  const submittedCases = mobilityCases.filter(
    (mobilityCase) => mobilityCase.statusDefinition.key === "submitted"
  );
  const missingDocuments: DashboardPanelItem[] = [];
  const openTasks: DashboardPanelItem[] = [];

  if (!user.academicTitleOption || !user.faculty || !user.department) {
    openTasks.push({
      id: "complete-profile",
      title: "Complete institutional profile",
      description:
        "Add or confirm your academic title, faculty, and department before submitted cases start reusing this data.",
      badge: "Action needed",
      meta: "/dashboard/profile"
    });
  }

  if (!currentAcademicYearLabel) {
    openTasks.push({
      id: "missing-academic-year",
      title: "Await academic year configuration",
      description:
        "No active academic year is configured yet, so submitted cases cannot be aligned with the current cycle.",
      badge: "Blocked",
      meta: "Admin setup required"
    });
  }

  for (const mobilityCase of draftCases.slice(0, 4)) {
    openTasks.push({
      id: `draft-${mobilityCase.id}`,
      title: mobilityCase.hostInstitution?.trim() || "Complete draft mobility case",
      description:
        "Draft case details remain editable. Complete the missing fields and submit the case when ready.",
      badge: "Draft",
      meta: `/dashboard/staff/cases/${mobilityCase.id}`
    });
  }

  for (const mobilityCase of mobilityCases) {
    if (!shouldTrackMissingDocuments(mobilityCase.statusDefinition.key)) {
      continue;
    }

    const missingForCase = getMissingRequiredDocuments(mobilityCase.documents);

    for (const missingDocument of missingForCase) {
      const item = {
        id: `${mobilityCase.id}-${missingDocument.key}`,
        title: mobilityCase.hostInstitution?.trim() || "Mobility case document missing",
        description: `${missingDocument.label} is still missing from this case record.`,
        badge: "Missing",
        meta: `/dashboard/staff/cases/${mobilityCase.id}`
      };

      missingDocuments.push(item);

      if (openTasks.length < 8) {
        openTasks.push(item);
      }
    }
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
    ownCasesCount: mobilityCases.length,
    draftCasesCount: draftCases.length,
    submittedCasesCount: submittedCases.length,
    missingDocumentsCount: missingDocuments.length,
    openTasksCount: openTasks.length,
    cases: mobilityCases.map((mobilityCase) => ({
      id: mobilityCase.id,
      academicYearLabel: mobilityCase.academicYear?.label ?? null,
      mobilityTypeLabel: mobilityCase.mobilityTypeOption?.label ?? null,
      hostInstitution: mobilityCase.hostInstitution?.trim() || "Host institution not set",
      hostLocation: formatCaseLocation(mobilityCase.hostCity, mobilityCase.hostCountry),
      dateRangeLabel: formatDateRangeLabel(mobilityCase.startDate, mobilityCase.endDate),
      status: {
        key: mobilityCase.statusDefinition.key,
        label: mobilityCase.statusDefinition.label
      },
      updatedAtLabel: formatDashboardDate(mobilityCase.updatedAt),
      submittedAtLabel: mobilityCase.submittedAt ? formatDashboardDate(mobilityCase.submittedAt) : null
    })),
    statusAreas: activeStatuses.map((status) => {
      const count = caseCountByStatusId.get(status.id) ?? 0;

      return {
        id: status.id,
        title: status.label,
        description:
          count > 0
            ? `${count} personal mobility case${count === 1 ? "" : "s"} currently sit in this status area.`
            : "No personal mobility cases are currently recorded in this status area.",
        badge: count.toString(),
        meta: currentAcademicYearLabel ?? "No active academic year"
      };
    }),
    missingDocuments,
    latestComments: latestComments.map((comment) => ({
      id: comment.id,
      title: comment.mobilityCase.hostInstitution?.trim() || "Mobility case comment",
      description: comment.body,
      badge: getUserDisplayName(comment.authorUser),
      meta: formatDashboardDate(comment.createdAt)
    })),
    openTasks,
    uploadPolicySummary
  };
}

export async function getReviewDashboardData(): Promise<ReviewDashboardData> {
  const [
    pendingRegistrations,
    activeAcademicYears,
    activeFacultyCount,
    activeDepartmentCount,
    activeStatusCount,
    submittedCaseCount,
    submittedCases,
    changesRequiredCaseCount,
    changesRequiredCases
  ] = await Promise.all([
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
        id: true,
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
    }),
    prisma.mobilityCase.count({
      where: {
        statusDefinition: {
          key: "submitted"
        }
      }
    }),
    prisma.mobilityCase.findMany({
      where: {
        statusDefinition: {
          key: "submitted"
        }
      },
      select: {
        id: true,
        hostInstitution: true,
        submittedAt: true,
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
        staffUser: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        documents: {
          select: {
            currentVersionId: true,
            documentTypeOption: {
              select: {
                key: true,
                label: true
              }
            }
          }
        }
      },
      orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
      take: 6
    }),
    prisma.mobilityCase.count({
      where: {
        statusDefinition: {
          key: "changes_required"
        }
      }
    }),
    prisma.mobilityCase.findMany({
      where: {
        statusDefinition: {
          key: "changes_required"
        }
      },
      select: {
        id: true,
        hostInstitution: true,
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
        staffUser: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        documents: {
          select: {
            currentVersionId: true,
            documentTypeOption: {
              select: {
                key: true,
                label: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 6
    })
  ]);

  const currentAcademicYear = getCurrentAcademicYear(activeAcademicYears);
  const currentAcademicYearLabel = currentAcademicYear?.label ?? null;
  const registrationItems = pendingRegistrations.map((registration) => ({
    id: registration.id,
    title: getUserDisplayName(registration),
    description: registration.faculty?.name
      ? `Pending staff registration from ${registration.faculty.name}.`
      : "Pending staff registration awaiting faculty assignment.",
    badge: "Pending",
    meta: `${registration.email} | ${formatDashboardDate(registration.createdAt)}`
  }));
  const submittedCaseItems = submittedCases.map((mobilityCase) => ({
    id: mobilityCase.id,
    title: buildCaseReviewTitle(mobilityCase),
    description: `${getUserDisplayName(mobilityCase.staffUser)} submitted a ${mobilityCase.mobilityTypeOption?.label?.toLowerCase() ?? "mobility"} case${mobilityCase.academicYear?.label ? ` for ${mobilityCase.academicYear.label}` : ""}.`,
    badge: "Submitted",
    meta: formatDashboardDate(mobilityCase.submittedAt ?? mobilityCase.updatedAt)
  }));
  const casesNeedingChangesItems = changesRequiredCases.map((mobilityCase) => ({
    id: mobilityCase.id,
    title: buildCaseReviewTitle(mobilityCase),
    description: `${getUserDisplayName(mobilityCase.staffUser)} has a case waiting on requested changes${mobilityCase.academicYear?.label ? ` for ${mobilityCase.academicYear.label}` : ""}.`,
    badge: "Changes",
    meta: formatDashboardDate(mobilityCase.updatedAt)
  }));
  const reviewCases = [...submittedCases, ...changesRequiredCases];
  const missingDocuments = reviewCases.flatMap((mobilityCase) => {
  const missingForCase = getMissingRequiredDocuments(mobilityCase.documents);

  if (missingForCase.length === 0) {
    return [];
  }

  return [
    {
      id: mobilityCase.id,
      title: buildCaseReviewTitle(mobilityCase),
      description: `Missing: ${missingForCase.map((document) => document.label).join(", ")}.`,
      badge: missingForCase.length === 1 ? "1 missing file" : `${missingForCase.length} missing files`,
      meta: mobilityCase.academicYear?.label ?? formatDashboardDate(mobilityCase.updatedAt)
    }
  ];
});
const openReviews = [...submittedCaseItems, ...casesNeedingChangesItems].slice(0, 6);
  const currentAcademicYearCaseCount = currentAcademicYear
    ? await prisma.mobilityCase.count({
        where: {
          academicYearId: currentAcademicYear.id
        }
      })
    : 0;

  return {
    currentAcademicYearLabel,
    newRegistrationsCount: pendingRegistrations.length,
    newSubmittedCasesCount: submittedCaseCount,
    missingDocumentsCount: missingDocuments.length,
    casesNeedingChangesCount: changesRequiredCaseCount,
    openReviewsCount: submittedCaseCount + changesRequiredCaseCount,
    newRegistrations: registrationItems,
    newSubmittedCases: submittedCaseItems,
    missingDocuments,
    casesNeedingChanges: casesNeedingChangesItems,
    openReviews,
    academicYearOverview: [
      {
        id: "current-academic-year",
        title: currentAcademicYearLabel ?? "Not configured",
        description: "Current academic year label used for protected workflows and reporting context.",
        meta: currentAcademicYearLabel ? "Current academic year" : "Admin setup required"
      },
      {
        id: "current-academic-year-cases",
        title: currentAcademicYearCaseCount.toString(),
        description: "Mobility case records currently linked to the active academic year context.",
        meta: "Case records"
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
        description: "Active workflow statuses prepared for the case lifecycle.",
        meta: "Status records"
      }
    ]
  };
}