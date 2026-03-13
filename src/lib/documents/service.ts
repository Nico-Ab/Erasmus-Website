import { randomUUID } from "node:crypto";
import { DocumentReviewState, SelectOptionCategory, UserRole } from "@prisma/client";
import { env } from "@/lib/env";
import {
  blockedDocumentUploadStatusKeys,
  documentReviewStateLabels,
  documentUploadStatusKeyByType,
  requiredDocumentTypeDefinitions,
  type RequiredDocumentTypeKey
} from "@/lib/documents/constants";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import type { StorageDriver } from "@/lib/storage/driver";
import {
  validateDocumentUploadFile,
  type DocumentUploadPolicy
} from "@/lib/validation/documents";

export type CaseDocumentVersionView = {
  id: string;
  versionNumber: number;
  versionLabel: string;
  originalFilename: string;
  uploadedAtLabel: string;
  sizeLabel: string;
  isCurrent: boolean;
  reviewState: {
    key: DocumentReviewState;
    label: string;
  };
  downloadPath: string;
};

export type CaseDocumentPanel = {
  id: string;
  documentType: {
    key: RequiredDocumentTypeKey;
    label: string;
  };
  uploadHint: string;
  canUpload: boolean;
  uploadDisabledReason: string | null;
  currentVersion: CaseDocumentVersionView | null;
  currentReviewStateLabel: string;
  versions: CaseDocumentVersionView[];
};

export type DocumentUploadResult =
  | {
      status: "uploaded";
      caseId: string;
      documentId: string;
      versionId: string;
      currentStatusKey: string;
    }
  | {
      status: "invalid_document_type" | "invalid_file" | "not_found" | "not_uploadable";
      message: string;
    };

export type AuthorizedDocumentDownload =
  | {
      status: "ready";
      file: Buffer;
      filename: string;
      mimeType: string | null;
    }
  | {
      status: "not_found" | "storage_missing";
    };

function normalizeAllowedExtensions(value: string | null | undefined) {
  if (!value) {
    return env.allowedUploadExtensions;
  }

  return value
    .split(",")
    .map((extension) => extension.trim().toLowerCase())
    .filter(Boolean);
}

function formatDocumentDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(value);
}

function formatFileSizeLabel(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

function getReviewStateLabel(reviewState: DocumentReviewState) {
  return documentReviewStateLabels[reviewState];
}

function getUploadDisabledReason(statusKey: string) {
  if (statusKey === "draft") {
    return "Submit the case before uploading required documents.";
  }

  if (statusKey === "archived" || statusKey === "completed") {
    return "This case is no longer open for additional uploads.";
  }

  return null;
}

function buildStorageKey(caseId: string, documentTypeKey: string, fileExtension: string) {
  const timestamp = new Date().toISOString().slice(0, 10);

  return `case-documents/${caseId}/${documentTypeKey}/${timestamp}/${randomUUID()}.${fileExtension}`;
}

function getTargetCaseStatusKey(documentTypeKey: RequiredDocumentTypeKey, currentStatusKey: string) {
  if (documentTypeKey === "mobility_agreement") {
    return currentStatusKey === "submitted" || currentStatusKey === "changes_required"
      ? documentUploadStatusKeyByType[documentTypeKey]
      : null;
  }

  if (
    [
      "submitted",
      "agreement_uploaded",
      "under_review",
      "approved",
      "mobility_ongoing",
      "changes_required"
    ].includes(currentStatusKey)
  ) {
    return documentUploadStatusKeyByType[documentTypeKey];
  }

  return null;
}

export function getDocumentVersionDownloadPath(versionId: string) {
  return `/api/documents/versions/${versionId}/download`;
}

export async function getDocumentUploadPolicy(): Promise<DocumentUploadPolicy> {
  const uploadSetting = await prisma.uploadSetting.findUnique({
    where: { id: "default" },
    select: {
      maxUploadSizeMb: true,
      allowedExtensions: true
    }
  });

  return {
    maxUploadSizeMb: uploadSetting?.maxUploadSizeMb ?? env.MAX_UPLOAD_SIZE_MB,
    allowedExtensions: normalizeAllowedExtensions(uploadSetting?.allowedExtensions)
  };
}

export async function getCaseDocumentPanels(
  mobilityCaseId: string,
  caseStatusKey: string
): Promise<{ uploadPolicy: DocumentUploadPolicy; documents: CaseDocumentPanel[] }> {
  const [uploadPolicy, documents] = await Promise.all([
    getDocumentUploadPolicy(),
    prisma.mobilityCaseDocument.findMany({
      where: {
        mobilityCaseId
      },
      select: {
        id: true,
        currentVersionId: true,
        documentTypeOption: {
          select: {
            key: true,
            label: true
          }
        },
        versions: {
          select: {
            id: true,
            versionNumber: true,
            originalFilename: true,
            sizeBytes: true,
            uploadedAt: true,
            reviewState: true
          },
          orderBy: [{ versionNumber: "desc" }, { uploadedAt: "desc" }]
        }
      }
    })
  ]);
  const documentMap = new Map(documents.map((document) => [document.documentTypeOption.key, document]));

  return {
    uploadPolicy,
    documents: requiredDocumentTypeDefinitions.map((definition) => {
      const document = documentMap.get(definition.key);
      const uploadDisabledReason = getUploadDisabledReason(caseStatusKey);
      const versions =
        document?.versions.map((version) => ({
          id: version.id,
          versionNumber: version.versionNumber,
          versionLabel: `v${version.versionNumber}`,
          originalFilename: version.originalFilename,
          uploadedAtLabel: formatDocumentDate(version.uploadedAt),
          sizeLabel: formatFileSizeLabel(version.sizeBytes),
          isCurrent: document.currentVersionId === version.id,
          reviewState: {
            key: version.reviewState,
            label: getReviewStateLabel(version.reviewState)
          },
          downloadPath: getDocumentVersionDownloadPath(version.id)
        })) ?? [];
      const currentVersion = versions.find((version) => version.isCurrent) ?? null;

      return {
        id: document?.id ?? `${mobilityCaseId}-${definition.key}`,
        documentType: {
          key: definition.key,
          label: document?.documentTypeOption.label ?? definition.label
        },
        uploadHint: definition.uploadHint,
        canUpload: !blockedDocumentUploadStatusKeys.has(caseStatusKey),
        uploadDisabledReason,
        currentVersion,
        currentReviewStateLabel: currentVersion?.reviewState.label ?? "Not uploaded",
        versions
      };
    })
  };
}

export async function uploadDocumentVersionForStaff(
  userId: string,
  caseId: string,
  documentTypeKey: RequiredDocumentTypeKey,
  file: File,
  storageDriver: StorageDriver = storage
): Promise<DocumentUploadResult> {
  const [mobilityCase, documentTypeOption, uploadPolicy] = await Promise.all([
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
    prisma.selectOption.findFirst({
      where: {
        category: SelectOptionCategory.DOCUMENT_TYPE,
        key: documentTypeKey,
        isActive: true
      },
      select: {
        id: true,
        key: true,
        label: true
      }
    }),
    getDocumentUploadPolicy()
  ]);

  if (!mobilityCase) {
    return {
      status: "not_found",
      message: "Mobility case not found."
    };
  }

  if (blockedDocumentUploadStatusKeys.has(mobilityCase.statusDefinition.key)) {
    return {
      status: "not_uploadable",
      message: getUploadDisabledReason(mobilityCase.statusDefinition.key) ?? "Uploads are not available for this case."
    };
  }

  if (!documentTypeOption) {
    return {
      status: "invalid_document_type",
      message: "Select a valid required document type."
    };
  }

  const validation = validateDocumentUploadFile(file, uploadPolicy);

  if (!validation.success) {
    return {
      status: "invalid_file",
      message: validation.message
    };
  }

  const targetStatusKey = getTargetCaseStatusKey(documentTypeKey, mobilityCase.statusDefinition.key);
  const targetStatus = targetStatusKey
    ? await prisma.caseStatusDefinition.findFirst({
        where: {
          key: targetStatusKey,
          isActive: true
        },
        select: {
          id: true,
          key: true
        }
      })
    : null;
  const storageKey = buildStorageKey(caseId, documentTypeKey, validation.data.fileExtension);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await storageDriver.write({
    key: storageKey,
    body: fileBuffer
  });

  try {
    const result = await prisma.$transaction(async (transaction) => {
      let document = await transaction.mobilityCaseDocument.findUnique({
        where: {
          mobilityCaseId_documentTypeOptionId: {
            mobilityCaseId: caseId,
            documentTypeOptionId: documentTypeOption.id
          }
        },
        select: {
          id: true,
          currentVersionId: true,
          versions: {
            select: {
              versionNumber: true
            },
            orderBy: {
              versionNumber: "desc"
            },
            take: 1
          }
        }
      });

      if (!document) {
        document = await transaction.mobilityCaseDocument.create({
          data: {
            mobilityCaseId: caseId,
            documentTypeOptionId: documentTypeOption.id
          },
          select: {
            id: true,
            currentVersionId: true,
            versions: {
              select: {
                versionNumber: true
              },
              orderBy: {
                versionNumber: "desc"
              },
              take: 1
            }
          }
        });
      }

      const version = await transaction.mobilityCaseDocumentVersion.create({
        data: {
          documentId: document.id,
          versionNumber: (document.versions[0]?.versionNumber ?? 0) + 1,
          originalFilename: validation.data.originalFilename,
          fileExtension: validation.data.fileExtension,
          mimeType: validation.data.mimeType,
          sizeBytes: validation.data.sizeBytes,
          storageKey,
          uploadedByUserId: userId
        },
        select: {
          id: true,
          versionNumber: true
        }
      });

      await transaction.mobilityCaseDocument.update({
        where: {
          id: document.id
        },
        data: {
          currentVersionId: version.id
        }
      });

      let currentStatusKey = mobilityCase.statusDefinition.key;

      if (targetStatus && targetStatus.id !== mobilityCase.statusDefinitionId) {
        await transaction.mobilityCase.update({
          where: {
            id: caseId
          },
          data: {
            statusDefinitionId: targetStatus.id
          }
        });
        await transaction.mobilityCaseStatusHistory.create({
          data: {
            mobilityCaseId: caseId,
            fromStatusDefinitionId: mobilityCase.statusDefinitionId,
            toStatusDefinitionId: targetStatus.id,
            changedByUserId: userId,
            note: `${documentTypeOption.label} uploaded by staff user.`
          }
        });
        currentStatusKey = targetStatus.key;
      }

      return {
        documentId: document.id,
        versionId: version.id,
        currentStatusKey
      };
    });

    return {
      status: "uploaded",
      caseId,
      documentId: result.documentId,
      versionId: result.versionId,
      currentStatusKey: result.currentStatusKey
    };
  } catch (error) {
    await storageDriver.delete(storageKey);
    throw error;
  }
}

export async function authorizeDocumentDownload(
  userId: string,
  role: UserRole,
  versionId: string,
  storageDriver: StorageDriver = storage
): Promise<AuthorizedDocumentDownload> {
  const version = await prisma.mobilityCaseDocumentVersion.findFirst({
    where: {
      id: versionId
    },
    select: {
      originalFilename: true,
      mimeType: true,
      storageKey: true,
      document: {
        select: {
          mobilityCase: {
            select: {
              staffUserId: true
            }
          }
        }
      }
    }
  });

  if (!version) {
    return { status: "not_found" };
  }

  if (role === UserRole.STAFF && version.document.mobilityCase.staffUserId !== userId) {
    return { status: "not_found" };
  }

  try {
    return {
      status: "ready",
      file: await storageDriver.read(version.storageKey),
      filename: version.originalFilename,
      mimeType: version.mimeType
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { status: "storage_missing" };
    }

    throw error;
  }
}