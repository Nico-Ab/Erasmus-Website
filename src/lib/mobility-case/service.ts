import { SelectOptionCategory } from "@prisma/client";
import { editableMobilityCaseStatusKeys, mobilityCaseStatusKeys } from "@/lib/mobility-case/constants";
import { prisma } from "@/lib/prisma";
import { formatRoleLabel } from "@/lib/utils";
import type { MobilityCaseFormValues, MobilityCaseIntent } from "@/lib/validation/mobility-case";

type ActivityPanelItem = {
  id: string;
  title: string;
  description: string;
  badge?: string;
  meta?: string;
};

export type MobilityCaseReferenceData = {
  academicYears: Array<{
    id: string;
    label: string;
  }>;
  mobilityTypes: Array<{
    id: string;
    key: string;
    label: string;
  }>;
};

export type StaffMobilityCaseDetailData = {
  case: {
    id: string;
    academicYearId: string;
    academicYearLabel: string | null;
    mobilityTypeOptionId: string;
    mobilityTypeLabel: string | null;
    hostInstitution: string;
    hostCountry: string;
    hostCity: string;
    startDate: string;
    endDate: string;
    notes: string;
    submittedAtLabel: string | null;
    createdAtLabel: string;
    updatedAtLabel: string;
    status: {
      key: string;
      label: string;
    };
  };
  academicYears: MobilityCaseReferenceData["academicYears"];
  mobilityTypes: MobilityCaseReferenceData["mobilityTypes"];
  isEditable: boolean;
  statusHistory: ActivityPanelItem[];
  comments: ActivityPanelItem[];
};

export type MobilityCaseMutationResult =
  | {
      status: "created" | "updated";
      caseId: string;
      currentStatusKey: string;
    }
  | {
      status:
        | "not_found"
        | "not_editable"
        | "invalid_academic_year"
        | "invalid_mobility_type";
    };

function normalizeOptionalText(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function toStorageDate(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function toDateInputValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

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

function formatHistoryDescription(fromLabel: string | null, toLabel: string, note: string | null) {
  const transitionText = fromLabel
    ? `Moved from ${fromLabel} to ${toLabel}.`
    : `Initial status set to ${toLabel}.`;

  return note ? `${transitionText} ${note}` : transitionText;
}

function buildPersistenceData(input: MobilityCaseFormValues) {
  return {
    academicYearId: input.academicYearId || null,
    mobilityTypeOptionId: input.mobilityTypeOptionId || null,
    hostInstitution: normalizeOptionalText(input.hostInstitution),
    hostCountry: normalizeOptionalText(input.hostCountry),
    hostCity: normalizeOptionalText(input.hostCity),
    startDate: toStorageDate(input.startDate),
    endDate: toStorageDate(input.endDate),
    notes: normalizeOptionalText(input.notes)
  };
}

async function getWorkflowStatuses() {
  const statuses = await prisma.caseStatusDefinition.findMany({
    where: {
      key: {
        in: [
          mobilityCaseStatusKeys.draft,
          mobilityCaseStatusKeys.submitted,
          mobilityCaseStatusKeys.changesRequired
        ]
      }
    },
    select: {
      id: true,
      key: true,
      label: true
    }
  });

  const draft = statuses.find((status) => status.key === mobilityCaseStatusKeys.draft);
  const submitted = statuses.find((status) => status.key === mobilityCaseStatusKeys.submitted);
  const changesRequired = statuses.find(
    (status) => status.key === mobilityCaseStatusKeys.changesRequired
  );

  if (!draft || !submitted) {
    throw new Error("Required case workflow statuses are not configured.");
  }

  return {
    draft,
    submitted,
    changesRequired
  };
}

async function ensureReferenceIntegrity(input: MobilityCaseFormValues) {
  const [academicYear, mobilityType] = await Promise.all([
    input.academicYearId
      ? prisma.academicYear.findFirst({
          where: {
            id: input.academicYearId,
            isActive: true
          },
          select: { id: true }
        })
      : Promise.resolve(null),
    input.mobilityTypeOptionId
      ? prisma.selectOption.findFirst({
          where: {
            id: input.mobilityTypeOptionId,
            category: SelectOptionCategory.MOBILITY_TYPE,
            isActive: true
          },
          select: { id: true }
        })
      : Promise.resolve(null)
  ]);

  if (input.academicYearId && !academicYear) {
    return { status: "invalid_academic_year" as const };
  }

  if (input.mobilityTypeOptionId && !mobilityType) {
    return { status: "invalid_mobility_type" as const };
  }

  return { status: "ok" as const };
}

export async function getMobilityCaseReferenceData(): Promise<MobilityCaseReferenceData> {
  const [academicYears, mobilityTypes] = await Promise.all([
    prisma.academicYear.findMany({
      where: { isActive: true },
      select: {
        id: true,
        label: true
      },
      orderBy: [{ sortOrder: "asc" }, { startYear: "asc" }]
    }),
    prisma.selectOption.findMany({
      where: {
        category: SelectOptionCategory.MOBILITY_TYPE,
        isActive: true
      },
      select: {
        id: true,
        key: true,
        label: true
      },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
    })
  ]);

  return {
    academicYears,
    mobilityTypes
  };
}

export async function getStaffMobilityCaseDetail(userId: string, caseId: string) {
  const [referenceData, mobilityCase] = await Promise.all([
    getMobilityCaseReferenceData(),
    prisma.mobilityCase.findFirst({
      where: {
        id: caseId,
        staffUserId: userId
      },
      select: {
        id: true,
        academicYearId: true,
        mobilityTypeOptionId: true,
        hostInstitution: true,
        hostCountry: true,
        hostCity: true,
        startDate: true,
        endDate: true,
        notes: true,
        submittedAt: true,
        createdAt: true,
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
                key: true,
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
    })
  ]);

  if (!mobilityCase) {
    return null;
  }

  return {
    case: {
      id: mobilityCase.id,
      academicYearId: mobilityCase.academicYearId ?? "",
      academicYearLabel: mobilityCase.academicYear?.label ?? null,
      mobilityTypeOptionId: mobilityCase.mobilityTypeOptionId ?? "",
      mobilityTypeLabel: mobilityCase.mobilityTypeOption?.label ?? null,
      hostInstitution: mobilityCase.hostInstitution ?? "",
      hostCountry: mobilityCase.hostCountry ?? "",
      hostCity: mobilityCase.hostCity ?? "",
      startDate: toDateInputValue(mobilityCase.startDate),
      endDate: toDateInputValue(mobilityCase.endDate),
      notes: mobilityCase.notes ?? "",
      submittedAtLabel: formatDateLabel(mobilityCase.submittedAt),
      createdAtLabel: formatDateLabel(mobilityCase.createdAt) ?? "Not set",
      updatedAtLabel: formatDateLabel(mobilityCase.updatedAt) ?? "Not set",
      status: {
        key: mobilityCase.statusDefinition.key,
        label: mobilityCase.statusDefinition.label
      }
    },
    academicYears: referenceData.academicYears,
    mobilityTypes: referenceData.mobilityTypes,
    isEditable: editableMobilityCaseStatusKeys.has(mobilityCase.statusDefinition.key),
    comments: mobilityCase.comments.map((comment) => ({
      id: comment.id,
      title: getUserDisplayName(comment.authorUser),
      description: comment.body,
      badge: formatRoleLabel(comment.authorUser.role),
      meta: formatDateLabel(comment.createdAt) ?? undefined
    })),
    statusHistory: mobilityCase.statusHistory.map((entry) => ({
      id: entry.id,
      title: entry.toStatusDefinition.label,
      description: formatHistoryDescription(
        entry.fromStatusDefinition?.label ?? null,
        entry.toStatusDefinition.label,
        entry.note
      ),
      badge: entry.changedByUser ? getUserDisplayName(entry.changedByUser) : undefined,
      meta: formatDateLabel(entry.createdAt) ?? undefined
    }))
  } satisfies StaffMobilityCaseDetailData;
}

export async function createMobilityCaseForStaff(
  userId: string,
  input: MobilityCaseFormValues,
  intent: MobilityCaseIntent
): Promise<MobilityCaseMutationResult> {
  const [statusDefinitions, referenceCheck] = await Promise.all([
    getWorkflowStatuses(),
    ensureReferenceIntegrity(input)
  ]);

  if (referenceCheck.status !== "ok") {
    return referenceCheck;
  }

  const targetStatus = intent === "submit" ? statusDefinitions.submitted : statusDefinitions.draft;
  const now = new Date();
  const data = buildPersistenceData(input);

  const mobilityCase = await prisma.$transaction(async (transaction) => {
    const createdCase = await transaction.mobilityCase.create({
      data: {
        staffUserId: userId,
        statusDefinitionId: targetStatus.id,
        submittedAt: intent === "submit" ? now : null,
        ...data
      },
      select: {
        id: true,
        statusDefinition: {
          select: {
            key: true
          }
        }
      }
    });

    await transaction.mobilityCaseStatusHistory.create({
      data: {
        mobilityCaseId: createdCase.id,
        fromStatusDefinitionId: null,
        toStatusDefinitionId: targetStatus.id,
        changedByUserId: userId,
        note:
          intent === "submit"
            ? "Case created and submitted by staff user."
            : "Case created as draft by staff user."
      }
    });

    return createdCase;
  });

  return {
    status: "created",
    caseId: mobilityCase.id,
    currentStatusKey: mobilityCase.statusDefinition.key
  };
}

export async function updateMobilityCaseForStaff(
  userId: string,
  caseId: string,
  input: MobilityCaseFormValues,
  intent: MobilityCaseIntent
): Promise<MobilityCaseMutationResult> {
  const [existingCase, statusDefinitions, referenceCheck] = await Promise.all([
    prisma.mobilityCase.findFirst({
      where: {
        id: caseId,
        staffUserId: userId
      },
      select: {
        id: true,
        statusDefinitionId: true,
        statusDefinition: {
          select: {
            key: true
          }
        }
      }
    }),
    getWorkflowStatuses(),
    ensureReferenceIntegrity(input)
  ]);

  if (!existingCase) {
    return { status: "not_found" };
  }

  if (!editableMobilityCaseStatusKeys.has(existingCase.statusDefinition.key)) {
    return { status: "not_editable" };
  }

  if (referenceCheck.status !== "ok") {
    return referenceCheck;
  }

  const nextStatus = intent === "submit" ? statusDefinitions.submitted : null;
  const statusChanged = Boolean(nextStatus && nextStatus.id !== existingCase.statusDefinitionId);
  const data = buildPersistenceData(input);
  const now = new Date();

  const mobilityCase = await prisma.$transaction(async (transaction) => {
    const updatedCase = await transaction.mobilityCase.update({
      where: { id: existingCase.id },
      data: {
        ...data,
        statusDefinitionId: nextStatus?.id ?? existingCase.statusDefinitionId,
        submittedAt: intent === "submit" ? now : null
      },
      select: {
        id: true,
        statusDefinition: {
          select: {
            key: true
          }
        }
      }
    });

    if (statusChanged && nextStatus) {
      await transaction.mobilityCaseStatusHistory.create({
        data: {
          mobilityCaseId: existingCase.id,
          fromStatusDefinitionId: existingCase.statusDefinitionId,
          toStatusDefinitionId: nextStatus.id,
          changedByUserId: userId,
          note: "Case submitted by staff user."
        }
      });
    }

    return updatedCase;
  });

  return {
    status: "updated",
    caseId: mobilityCase.id,
    currentStatusKey: mobilityCase.statusDefinition.key
  };
}

export function getEmptyMobilityCaseFormValues() {
  return {
    academicYearId: "",
    mobilityTypeOptionId: "",
    hostInstitution: "",
    hostCountry: "",
    hostCity: "",
    startDate: "",
    endDate: "",
    notes: ""
  } satisfies MobilityCaseFormValues;
}

export function getMobilityCaseSubmitLabel(intent: MobilityCaseIntent) {
  return intent === "submit" ? "Submit case" : "Save draft";
}

export function getMobilityCaseRedirectPath(caseId: string, intent: MobilityCaseIntent) {
  return `/dashboard/staff/cases/${caseId}?saved=${intent === "submit" ? "submitted" : "draft"}&savedAt=${Date.now()}`;
}