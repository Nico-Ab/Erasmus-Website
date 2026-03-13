import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  formatAuditActionLabel,
  formatAuditEntityLabel
} from "@/lib/audit/constants";

export type AuditLogInput = {
  actorUserId?: string | null;
  targetUserId?: string | null;
  mobilityCaseId?: string | null;
  documentId?: string | null;
  documentVersionId?: string | null;
  actionType: string;
  entityType: string;
  entityId: string;
  summary: string;
  details?: Prisma.InputJsonValue;
};

type AuditLogWriter = {
  auditLog: {
    create: (args: Prisma.AuditLogCreateArgs) => Promise<unknown>;
  };
};

function formatAuditDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(value);
}

function getUserDisplayName(user: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
} | null) {
  if (!user) {
    return "System";
  }

  const trimmedName = user.name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  const composedName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return composedName || user.email;
}

function getTargetLabel(entry: {
  targetUser: {
    email: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  mobilityCase: {
    hostInstitution: string | null;
  } | null;
  document: {
    documentTypeOption: {
      label: string;
    };
  } | null;
  documentVersion: {
    versionNumber: number;
    originalFilename: string;
  } | null;
  entityType: string;
  entityId: string;
}) {
  if (entry.targetUser) {
    return `${getUserDisplayName(entry.targetUser)} (${entry.targetUser.email})`;
  }

  if (entry.documentVersion) {
    return `Version ${entry.documentVersion.versionNumber}: ${entry.documentVersion.originalFilename}`;
  }

  if (entry.document) {
    return entry.document.documentTypeOption.label;
  }

  if (entry.mobilityCase) {
    return entry.mobilityCase.hostInstitution?.trim() || entry.entityId;
  }

  return entry.entityId;
}

function getDetailsLines(details: Prisma.JsonValue | null) {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return [];
  }

  return Object.entries(details).map(([key, value]) => `${formatAuditEntityLabel(key)}: ${String(value)}`);
}

export async function createAuditLog(client: AuditLogWriter, input: AuditLogInput) {
  return client.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      targetUserId: input.targetUserId ?? null,
      mobilityCaseId: input.mobilityCaseId ?? null,
      documentId: input.documentId ?? null,
      documentVersionId: input.documentVersionId ?? null,
      actionType: input.actionType,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      details: input.details
    }
  });
}

export async function getAuditLogPageData() {
  const entries = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      actionType: true,
      entityType: true,
      entityId: true,
      summary: true,
      details: true,
      createdAt: true,
      actorUser: {
        select: {
          name: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      targetUser: {
        select: {
          name: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      mobilityCase: {
        select: {
          hostInstitution: true
        }
      },
      document: {
        select: {
          documentTypeOption: {
            select: {
              label: true
            }
          }
        }
      },
      documentVersion: {
        select: {
          versionNumber: true,
          originalFilename: true
        }
      }
    }
  });

  return {
    entries: entries.map((entry) => ({
      id: entry.id,
      actorName: getUserDisplayName(entry.actorUser),
      actionLabel: formatAuditActionLabel(entry.actionType),
      entityLabel: formatAuditEntityLabel(entry.entityType),
      targetLabel: getTargetLabel(entry),
      summary: entry.summary,
      createdAtLabel: formatAuditDate(entry.createdAt),
      detailLines: getDetailsLines(entry.details)
    })),
    metrics: {
      totalEntries: entries.length,
      userActions: entries.filter((entry) => entry.entityType === "USER").length,
      workflowActions: entries.filter((entry) => entry.entityType !== "USER").length
    }
  };
}