import { DocumentReviewState, Prisma } from "@prisma/client";
import { auditActionTypes, auditEntityTypes } from "@/lib/audit/constants";
import { createAuditLog } from "@/lib/audit/service";
import { getCaseDocumentPanels, type CaseDocumentPanel } from "@/lib/documents/service";
import {
  requiredDocumentTypeDefinitions,
  type RequiredDocumentTypeKey
} from "@/lib/documents/constants";
import { prisma } from "@/lib/prisma";
import { formatRoleLabel } from "@/lib/utils";
import type { ReviewCaseFiltersInput } from "@/lib/validation/review-workflow";

type CaseActivityItem = {
  id: string;
  title: string;
  description: string;
  badge?: string;
  meta?: string;
};

type ReviewCaseListItem = {
  id: string;
  staffName: string;
  staffEmail: string;
  facultyName: string;
  departmentName: string;
  academicYearLabel: string | null;
  mobilityTypeLabel: string | null;
  hostInstitution: string;
  hostCountry: string;
  hostCity: string;
  dateRangeLabel: string;
  status: {
    key: string;
    label: string;
  };
  updatedAtLabel: string;
  missingDocumentsCount: number;
  pendingDocumentReviewsCount: number;
  rejectedDocumentsCount: number;
};

export type ReviewCaseListData = {
  filters: ReviewCaseFiltersInput;
  filterOptions: {
    statuses: Array<{ id: string; label: string }>;
    academicYears: Array<{ id: string; label: string }>;
    faculties: Array<{ id: string; name: string }>;
    departments: Array<{ id: string; name: string; facultyId: string }>;
    mobilityTypes: Array<{ id: string; label: string }>;
  };
  metrics: {
    totalResults: number;
    submittedCount: number;
    openReviewCount: number;
    missingDocumentsCount: number;
    archivedCount: number;
  };
  cases: ReviewCaseListItem[];
};

export type ReviewCaseDetailData = {
  case: {
    id: string;
    academicYearLabel: string | null;
    mobilityTypeLabel: string | null;
    hostInstitution: string;
    hostCountry: string;
    hostCity: string;
    startDateLabel: string | null;
    endDateLabel: string | null;
    notes: string | null;
    createdAtLabel: string;
    updatedAtLabel: string;
    submittedAtLabel: string | null;
    status: {
      key: string;
      label: string;
    };
  };
  staff: {
    name: string;
    email: string;
    academicTitle: string | null;
    faculty: string | null;
    department: string | null;
  };
  documents: CaseDocumentPanel[];
  missingDocuments: Array<{
    key: RequiredDocumentTypeKey;
    label: string;
  }>;
  statusOptions: Array<{
    key: string;
    label: string;
  }>;
  comments: Array<{
    id: string;
    body: string;
    authorName: string;
    authorRoleLabel: string;
    createdAtLabel: string;
  }>;
  statusHistory: CaseActivityItem[];
};

export type ReviewCaseStatusResult =
  | {
      status: "updated";
      currentStatusKey: string;
    }
  | {
      status: "not_found" | "invalid_status" | "invalid_transition" | "no_change";
      message: string;
    };

export type ReviewCommentResult =
  | {
      status: "created";
      commentId: string;
    }
  | {
      status: "not_found";
      message: string;
    };

export type ReviewDocumentResult =
  | {
      status: "reviewed";
      reviewState: DocumentReviewState;
    }
  | {
      status: "not_found" | "not_current_version" | "invalid_reason";
      message: string;
    };

export type MissingDocumentNoteResult =
  | {
      status: "created";
      commentId: string;
    }
  | {
      status: "not_found" | "not_missing";
      message: string;
    };

function formatDateLabel(value: Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

function formatDateRangeLabel(startDate: Date | null, endDate: Date | null) {
  if (startDate && endDate) {
    return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
  }

  if (startDate) {
    return `Starts ${formatDateLabel(startDate)}`;
  }

  if (endDate) {
    return `Ends ${formatDateLabel(endDate)}`;
  }

  return "Dates not set";
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


function countDocumentStates(documents: Array<{ currentVersionId: string | null; currentVersion: { reviewState: DocumentReviewState } | null }>) {
  const currentDocuments = documents.filter((document) => Boolean(document.currentVersionId));
  const missingDocumentsCount = requiredDocumentTypeDefinitions.length - currentDocuments.length;
  const pendingDocumentReviewsCount = currentDocuments.filter(
    (document) => document.currentVersion?.reviewState === DocumentReviewState.PENDING_REVIEW
  ).length;
  const rejectedDocumentsCount = currentDocuments.filter(
    (document) => document.currentVersion?.reviewState === DocumentReviewState.REJECTED
  ).length;

  return {
    missingDocumentsCount,
    pendingDocumentReviewsCount,
    rejectedDocumentsCount
  };
}

function buildReviewCaseWhere(filters: ReviewCaseFiltersInput): Prisma.MobilityCaseWhereInput {
  const conditions: Prisma.MobilityCaseWhereInput[] = [];

  if (filters.statusDefinitionId) {
    conditions.push({ statusDefinitionId: filters.statusDefinitionId });
  }

  if (filters.academicYearId) {
    conditions.push({ academicYearId: filters.academicYearId });
  }

  if (filters.facultyId) {
    conditions.push({
      staffUser: {
        facultyId: filters.facultyId
      }
    });
  }

  if (filters.departmentId) {
    conditions.push({
      staffUser: {
        departmentId: filters.departmentId
      }
    });
  }

  if (filters.mobilityTypeOptionId) {
    conditions.push({ mobilityTypeOptionId: filters.mobilityTypeOptionId });
  }

  if (filters.country) {
    conditions.push({
      hostCountry: {
        contains: filters.country,
        mode: "insensitive"
      }
    });
  }

  if (filters.hostInstitution) {
    conditions.push({
      hostInstitution: {
        contains: filters.hostInstitution,
        mode: "insensitive"
      }
    });
  }

  if (filters.search) {
    conditions.push({
      OR: [
        {
          hostInstitution: {
            contains: filters.search,
            mode: "insensitive"
          }
        },
        {
          hostCountry: {
            contains: filters.search,
            mode: "insensitive"
          }
        },
        {
          hostCity: {
            contains: filters.search,
            mode: "insensitive"
          }
        },
        {
          staffUser: {
            email: {
              contains: filters.search,
              mode: "insensitive"
            }
          }
        },
        {
          staffUser: {
            firstName: {
              contains: filters.search,
              mode: "insensitive"
            }
          }
        },
        {
          staffUser: {
            lastName: {
              contains: filters.search,
              mode: "insensitive"
            }
          }
        },
        {
          staffUser: {
            name: {
              contains: filters.search,
              mode: "insensitive"
            }
          }
        }
      ]
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

function buildStatusHistoryDescription(fromLabel: string | null, toLabel: string, note: string | null) {
  const transition = fromLabel ? `Moved from ${fromLabel} to ${toLabel}.` : `Initial status set to ${toLabel}.`;

  return note ? `${transition} ${note}` : transition;
}

function getAvailableReviewStatuses(
  currentStatusKey: string,
  statuses: Array<{ key: string; label: string }>
) {
  if (currentStatusKey === "archived") {
    return statuses.filter((status) => status.key === "archived");
  }

  return statuses.filter((status) => {
    if (status.key === "draft") {
      return false;
    }

    if (status.key === "archived") {
      return currentStatusKey === "completed";
    }

    return true;
  });
}

export async function getReviewCaseListData(filters: ReviewCaseFiltersInput): Promise<ReviewCaseListData> {
  const where = buildReviewCaseWhere(filters);
  const [statuses, academicYears, faculties, departments, mobilityTypes, mobilityCases] = await Promise.all([
    prisma.caseStatusDefinition.findMany({
      where: { isActive: true },
      select: {
        id: true,
        label: true
      },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
    }),
    prisma.academicYear.findMany({
      where: { isActive: true },
      select: {
        id: true,
        label: true
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
        label: true
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
        startDate: true,
        endDate: true,
        updatedAt: true,
        statusDefinition: {
          select: {
            key: true,
            label: true
          }
        },
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
            currentVersion: {
              select: {
                reviewState: true
              }
            }
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }]
    })
  ]);

  const cases = mobilityCases.map((mobilityCase) => {
    const documentCounts = countDocumentStates(mobilityCase.documents);

    return {
      id: mobilityCase.id,
      staffName: getUserDisplayName(mobilityCase.staffUser),
      staffEmail: mobilityCase.staffUser.email,
      facultyName: mobilityCase.staffUser.faculty?.name ?? "Not assigned",
      departmentName: mobilityCase.staffUser.department?.name ?? "Not assigned",
      academicYearLabel: mobilityCase.academicYear?.label ?? null,
      mobilityTypeLabel: mobilityCase.mobilityTypeOption?.label ?? null,
      hostInstitution: mobilityCase.hostInstitution?.trim() || "Host institution not set",
      hostCountry: mobilityCase.hostCountry?.trim() || "Country not set",
      hostCity: mobilityCase.hostCity?.trim() || "City not set",
      dateRangeLabel: formatDateRangeLabel(mobilityCase.startDate, mobilityCase.endDate),
      status: {
        key: mobilityCase.statusDefinition.key,
        label: mobilityCase.statusDefinition.label
      },
      updatedAtLabel: formatDateLabel(mobilityCase.updatedAt) ?? "Not set",
      missingDocumentsCount: documentCounts.missingDocumentsCount,
      pendingDocumentReviewsCount: documentCounts.pendingDocumentReviewsCount,
      rejectedDocumentsCount: documentCounts.rejectedDocumentsCount
    } satisfies ReviewCaseListItem;
  });

  return {
    filters,
    filterOptions: {
      statuses,
      academicYears,
      faculties,
      departments,
      mobilityTypes
    },
    metrics: {
      totalResults: cases.length,
      submittedCount: cases.filter((mobilityCase) => mobilityCase.status.key === "submitted").length,
      openReviewCount: cases.filter((mobilityCase) => mobilityCase.status.key !== "archived").length,
      missingDocumentsCount: cases.reduce((total, mobilityCase) => total + mobilityCase.missingDocumentsCount, 0),
      archivedCount: cases.filter((mobilityCase) => mobilityCase.status.key === "archived").length
    },
    cases
  };
}

export async function getReviewCaseDetail(caseId: string): Promise<ReviewCaseDetailData | null> {
  const [mobilityCase, activeStatuses] = await Promise.all([
    prisma.mobilityCase.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        hostInstitution: true,
        hostCountry: true,
        hostCity: true,
        startDate: true,
        endDate: true,
        notes: true,
        createdAt: true,
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
        },
        comments: {
          select: {
            id: true,
            body: true,
            createdAt: true,
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
          orderBy: { createdAt: "desc" }
        },
        statusHistory: {
          select: {
            id: true,
            note: true,
            createdAt: true,
            fromStatusDefinition: {
              select: {
                label: true
              }
            },
            toStatusDefinition: {
              select: {
                label: true
              }
            },
            changedByUser: {
              select: {
                name: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    }),
    prisma.caseStatusDefinition.findMany({
      where: { isActive: true },
      select: {
        key: true,
        label: true
      },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
    })
  ]);

  if (!mobilityCase) {
    return null;
  }

  const documentData = await getCaseDocumentPanels(mobilityCase.id, mobilityCase.statusDefinition.key);
  const missingDocuments = requiredDocumentTypeDefinitions
    .filter(
      (definition) =>
        !documentData.documents.some(
          (document) => document.documentType.key === definition.key && document.currentVersion
        )
    )
    .map((definition) => ({
      key: definition.key,
      label: definition.label
    }));

  return {
    case: {
      id: mobilityCase.id,
      academicYearLabel: mobilityCase.academicYear?.label ?? null,
      mobilityTypeLabel: mobilityCase.mobilityTypeOption?.label ?? null,
      hostInstitution: mobilityCase.hostInstitution?.trim() || "Host institution not set",
      hostCountry: mobilityCase.hostCountry?.trim() || "Country not set",
      hostCity: mobilityCase.hostCity?.trim() || "City not set",
      startDateLabel: formatDateLabel(mobilityCase.startDate),
      endDateLabel: formatDateLabel(mobilityCase.endDate),
      notes: mobilityCase.notes,
      createdAtLabel: formatDateLabel(mobilityCase.createdAt) ?? "Not set",
      updatedAtLabel: formatDateLabel(mobilityCase.updatedAt) ?? "Not set",
      submittedAtLabel: formatDateLabel(mobilityCase.submittedAt),
      status: {
        key: mobilityCase.statusDefinition.key,
        label: mobilityCase.statusDefinition.label
      }
    },
    staff: {
      name: getUserDisplayName(mobilityCase.staffUser),
      email: mobilityCase.staffUser.email,
      academicTitle: mobilityCase.staffUser.academicTitleOption?.label ?? null,
      faculty: mobilityCase.staffUser.faculty?.name ?? null,
      department: mobilityCase.staffUser.department?.name ?? null
    },
    documents: documentData.documents,
    missingDocuments,
    statusOptions: getAvailableReviewStatuses(mobilityCase.statusDefinition.key, activeStatuses),
    comments: mobilityCase.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      authorName: getUserDisplayName(comment.authorUser),
      authorRoleLabel: formatRoleLabel(comment.authorUser.role),
      createdAtLabel: formatDateLabel(comment.createdAt) ?? "Not set"
    })),
    statusHistory: mobilityCase.statusHistory.map((entry) => ({
      id: entry.id,
      title: entry.toStatusDefinition.label,
      description: buildStatusHistoryDescription(
        entry.fromStatusDefinition?.label ?? null,
        entry.toStatusDefinition.label,
        entry.note
      ),
      badge: entry.changedByUser ? getUserDisplayName(entry.changedByUser) : undefined,
      meta: formatDateLabel(entry.createdAt) ?? undefined
    }))
  };
}

export async function changeReviewCaseStatus(
  reviewerUserId: string,
  caseId: string,
  nextStatusKey: string,
  note: string
): Promise<ReviewCaseStatusResult> {
  const mobilityCase = await prisma.mobilityCase.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      statusDefinitionId: true,
      statusDefinition: {
        select: {
          key: true,
          label: true
        }
      }
    }
  });

  if (!mobilityCase) {
    return {
      status: "not_found",
      message: "Mobility case not found."
    };
  }

  if (mobilityCase.statusDefinition.key === "archived") {
    return {
      status: "invalid_transition",
      message: "Archived cases remain searchable but cannot re-enter the active workflow."
    };
  }

  if (mobilityCase.statusDefinition.key === "draft") {
    return {
      status: "invalid_transition",
      message: "Draft cases must be submitted by staff before officer review actions begin."
    };
  }

  if (nextStatusKey === mobilityCase.statusDefinition.key) {
    return {
      status: "no_change",
      message: "Select a different status to record a new review transition."
    };
  }

  if (nextStatusKey === "draft") {
    return {
      status: "invalid_status",
      message: "Officers cannot move cases back into draft."
    };
  }

  const nextStatus = await prisma.caseStatusDefinition.findFirst({
    where: {
      key: nextStatusKey,
      isActive: true
    },
    select: {
      id: true,
      key: true,
      label: true
    }
  });

  if (!nextStatus) {
    return {
      status: "invalid_status",
      message: "Select a valid workflow status."
    };
  }

  if (nextStatus.key === "archived" && mobilityCase.statusDefinition.key !== "completed") {
    return {
      status: "invalid_transition",
      message: "Only completed cases can be archived."
    };
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.mobilityCase.update({
      where: { id: caseId },
      data: {
        statusDefinitionId: nextStatus.id
      }
    });

    await transaction.mobilityCaseStatusHistory.create({
      data: {
        mobilityCaseId: caseId,
        fromStatusDefinitionId: mobilityCase.statusDefinitionId,
        toStatusDefinitionId: nextStatus.id,
        changedByUserId: reviewerUserId,
        note: note.trim() || `Status updated to ${nextStatus.label} during officer review.`
      }
    });

    await createAuditLog(transaction, {
      actorUserId: reviewerUserId,
      mobilityCaseId: caseId,
      actionType: auditActionTypes.caseStatusChanged,
      entityType: auditEntityTypes.mobilityCase,
      entityId: caseId,
      summary: `Officer changed case status from ${mobilityCase.statusDefinition.label} to ${nextStatus.label}.`,
      details: {
        previousStatus: mobilityCase.statusDefinition.key,
        nextStatus: nextStatus.key,
        note: note.trim() || null
      }
    });
  });

  return {
    status: "updated",
    currentStatusKey: nextStatus.key
  };
}

export async function createReviewCaseComment(
  reviewerUserId: string,
  caseId: string,
  body: string
): Promise<ReviewCommentResult> {
  const mobilityCase = await prisma.mobilityCase.findUnique({
    where: { id: caseId },
    select: {
      id: true
    }
  });

  if (!mobilityCase) {
    return {
      status: "not_found",
      message: "Mobility case not found."
    };
  }

  const comment = await prisma.$transaction(async (transaction) => {
    const createdComment = await transaction.mobilityCaseComment.create({
      data: {
        mobilityCaseId: caseId,
        authorUserId: reviewerUserId,
        body: body.trim()
      },
      select: {
        id: true
      }
    });

    await createAuditLog(transaction, {
      actorUserId: reviewerUserId,
      mobilityCaseId: caseId,
      actionType: auditActionTypes.caseCommentAdded,
      entityType: auditEntityTypes.comment,
      entityId: createdComment.id,
      summary: "Officer added a case review comment.",
      details: {
        commentId: createdComment.id
      }
    });

    return createdComment;
  });

  return {
    status: "created",
    commentId: comment.id
  };
}

export async function reviewDocumentVersion(
  reviewerUserId: string,
  caseId: string,
  versionId: string,
  decision: "accept" | "reject",
  reason: string
): Promise<ReviewDocumentResult> {
  const version = await prisma.mobilityCaseDocumentVersion.findFirst({
    where: {
      id: versionId,
      document: {
        mobilityCaseId: caseId
      }
    },
    select: {
      id: true,
      document: {
        select: {
          id: true,
          currentVersionId: true,
          documentTypeOption: {
            select: {
              label: true,
              key: true
            }
          }
        }
      }
    }
  });

  if (!version) {
    return {
      status: "not_found",
      message: "Document version not found."
    };
  }

  if (version.document.currentVersionId !== version.id) {
    return {
      status: "not_current_version",
      message: "Only the current document version can be reviewed."
    };
  }

  const trimmedReason = reason.trim();

  if (decision === "reject" && trimmedReason.length === 0) {
    return {
      status: "invalid_reason",
      message: "Provide a reason when rejecting a document."
    };
  }

  const reviewState = decision === "accept" ? DocumentReviewState.ACCEPTED : DocumentReviewState.REJECTED;

  await prisma.$transaction(async (transaction) => {
    await transaction.mobilityCaseDocumentVersion.update({
      where: { id: versionId },
      data: {
        reviewState,
        reviewComment: trimmedReason || null,
        reviewedAt: new Date(),
        reviewedByUserId: reviewerUserId
      }
    });

    await createAuditLog(transaction, {
      actorUserId: reviewerUserId,
      mobilityCaseId: caseId,
      documentId: version.document.id,
      documentVersionId: versionId,
      actionType: auditActionTypes.documentReviewed,
      entityType: auditEntityTypes.documentVersion,
      entityId: versionId,
      summary: `Officer ${decision === "accept" ? "accepted" : "rejected"} the current ${version.document.documentTypeOption.label} version.`,
      details: {
        decision,
        reviewState,
        reason: trimmedReason || null
      }
    });
  });

  return {
    status: "reviewed",
    reviewState
  };
}

export async function markMissingDocumentForReview(
  reviewerUserId: string,
  caseId: string,
  documentTypeKey: RequiredDocumentTypeKey,
  note: string
): Promise<MissingDocumentNoteResult> {
  const documentDefinition = requiredDocumentTypeDefinitions.find(
    (definition) => definition.key === documentTypeKey
  );

  if (!documentDefinition) {
    return {
      status: "not_found",
      message: "Document definition not found."
    };
  }

  const mobilityCase = await prisma.mobilityCase.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      documents: {
        where: {
          documentTypeOption: {
            key: documentTypeKey
          }
        },
        select: {
          currentVersionId: true
        },
        take: 1
      }
    }
  });

  if (!mobilityCase) {
    return {
      status: "not_found",
      message: "Mobility case not found."
    };
  }

  if (mobilityCase.documents[0]?.currentVersionId) {
    return {
      status: "not_missing",
      message: "This document is already present on the case record."
    };
  }

  const commentBody = note.trim()
    ? `${documentDefinition.label} is missing from the case record. ${note.trim()}`
    : `${documentDefinition.label} is missing from the case record.`;

  const comment = await prisma.$transaction(async (transaction) => {
    const createdComment = await transaction.mobilityCaseComment.create({
      data: {
        mobilityCaseId: caseId,
        authorUserId: reviewerUserId,
        body: commentBody
      },
      select: {
        id: true
      }
    });

    await createAuditLog(transaction, {
      actorUserId: reviewerUserId,
      mobilityCaseId: caseId,
      actionType: auditActionTypes.caseCommentAdded,
      entityType: auditEntityTypes.comment,
      entityId: createdComment.id,
      summary: "Officer added a missing-document comment.",
      details: {
        commentId: createdComment.id,
        documentTypeKey
      }
    });

    await createAuditLog(transaction, {
      actorUserId: reviewerUserId,
      mobilityCaseId: caseId,
      actionType: auditActionTypes.documentMarkedMissing,
      entityType: auditEntityTypes.document,
      entityId: `${caseId}:${documentTypeKey}`,
      summary: `${documentDefinition.label} marked as missing during officer review.`,
      details: {
        documentTypeKey,
        commentId: createdComment.id
      }
    });

    return createdComment;
  });

  return {
    status: "created",
    commentId: comment.id
  };
}