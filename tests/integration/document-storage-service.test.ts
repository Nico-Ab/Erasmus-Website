import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { UserRole } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authorizeDocumentDownload, uploadDocumentVersionForStaff } from "@/lib/documents/service";
import { LocalFileStorage } from "@/lib/storage/local-driver";

const { prismaMock } = vi.hoisted(() => {
  const transactionMock = {
    mobilityCase: {
      update: vi.fn()
    },
    mobilityCaseDocument: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    mobilityCaseDocumentVersion: {
      create: vi.fn()
    },
    mobilityCaseStatusHistory: {
      create: vi.fn()
    },
    auditLog: {
      create: vi.fn()
    }
  };

  return {
    prismaMock: {
      uploadSetting: {
        findUnique: vi.fn()
      },
      mobilityCase: {
        findFirst: vi.fn()
      },
      selectOption: {
        findFirst: vi.fn()
      },
      caseStatusDefinition: {
        findFirst: vi.fn()
      },
      mobilityCaseDocumentVersion: {
        findFirst: vi.fn()
      },
      $transaction: vi.fn(async (callback: (client: typeof transactionMock) => unknown) =>
        callback(transactionMock)
      ),
      __transaction: transactionMock
    }
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

function createUploadFile(fileName: string, contents: string, mimeType = "application/pdf") {
  const bytes = new TextEncoder().encode(contents);
  const file = new File([bytes], fileName, { type: mimeType }) as File & {
    arrayBuffer: () => Promise<ArrayBuffer>;
  };

  file.arrayBuffer = async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

  return file;
}

async function listStoredFiles(rootDirectory: string, currentDirectory = rootDirectory): Promise<string[]> {
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(currentDirectory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listStoredFiles(rootDirectory, fullPath)));
      continue;
    }

    files.push(path.relative(rootDirectory, fullPath));
  }

  return files;
}

describe("document storage and metadata handling", () => {
  let storageRoot = "";

  beforeEach(async () => {
    vi.clearAllMocks();
    storageRoot = await mkdtemp(path.join(os.tmpdir(), "swu-documents-"));
    prismaMock.uploadSetting.findUnique.mockResolvedValue({
      maxUploadSizeMb: 15,
      allowedExtensions: "pdf,doc,docx"
    });
    prismaMock.selectOption.findFirst.mockResolvedValue({
      id: "document_type_agreement",
      key: "mobility_agreement",
      label: "Mobility Agreement"
    });
  });

  afterEach(async () => {
    if (storageRoot) {
      await rm(storageRoot, { recursive: true, force: true });
    }
  });

  it("writes files to the local storage root and blocks path traversal", async () => {
    const storage = new LocalFileStorage(storageRoot);

    await storage.write({
      key: "case-documents/case_1/agreement/file.pdf",
      body: Buffer.from("agreement")
    });

    await expect(storage.read("../escape.pdf")).rejects.toThrow(/outside the configured root/i);
    await expect(storage.read("case-documents/case_1/agreement/file.pdf")).resolves.toEqual(
      Buffer.from("agreement")
    );
  });

  it("creates the first document version, stores the file, and records metadata plus audit entries", async () => {
    prismaMock.mobilityCase.findFirst.mockResolvedValue({
      id: "case_1",
      statusDefinitionId: "status_submitted",
      statusDefinition: {
        key: "submitted"
      }
    });
    prismaMock.caseStatusDefinition.findFirst.mockResolvedValue({
      id: "status_agreement_uploaded",
      key: "agreement_uploaded",
      label: "Agreement Uploaded"
    });
    prismaMock.__transaction.mobilityCaseDocument.findUnique.mockResolvedValue(null);
    prismaMock.__transaction.mobilityCaseDocument.create.mockResolvedValue({
      id: "document_1",
      currentVersionId: null,
      versions: []
    });
    prismaMock.__transaction.mobilityCaseDocumentVersion.create.mockResolvedValue({
      id: "version_1",
      versionNumber: 1
    });

    const storage = new LocalFileStorage(storageRoot);
    const result = await uploadDocumentVersionForStaff(
      "staff_user",
      "case_1",
      "mobility_agreement",
      createUploadFile("agreement-v1.pdf", "agreement-v1"),
      storage
    );

    expect(result).toEqual({
      status: "uploaded",
      caseId: "case_1",
      documentId: "document_1",
      versionId: "version_1",
      currentStatusKey: "agreement_uploaded"
    });
    expect(prismaMock.__transaction.mobilityCaseDocumentVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          documentId: "document_1",
          versionNumber: 1,
          originalFilename: "agreement-v1.pdf",
          fileExtension: "pdf",
          uploadedByUserId: "staff_user"
        })
      })
    );
    expect(prismaMock.__transaction.mobilityCaseDocument.update).toHaveBeenCalledWith({
      where: {
        id: "document_1"
      },
      data: {
        currentVersionId: "version_1"
      }
    });
    expect(prismaMock.__transaction.mobilityCase.update).toHaveBeenCalledWith({
      where: {
        id: "case_1"
      },
      data: {
        statusDefinitionId: "status_agreement_uploaded"
      }
    });
    expect(prismaMock.__transaction.auditLog.create).toHaveBeenCalledTimes(3);
    expect(prismaMock.__transaction.auditLog.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          actionType: "DOCUMENT_UPLOADED",
          entityId: "version_1"
        })
      })
    );
    expect(prismaMock.__transaction.auditLog.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          actionType: "DOCUMENT_CURRENT_VERSION_CHANGED",
          entityId: "document_1"
        })
      })
    );
    expect(prismaMock.__transaction.auditLog.create).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: expect.objectContaining({
          actionType: "CASE_STATUS_CHANGED",
          entityId: "case_1"
        })
      })
    );

    const storageKey =
      prismaMock.__transaction.mobilityCaseDocumentVersion.create.mock.calls[0][0].data.storageKey;

    await expect(readFile(path.join(storageRoot, storageKey))).resolves.toEqual(
      Buffer.from("agreement-v1")
    );
  });

  it("preserves prior versions and moves the current version marker forward", async () => {
    prismaMock.mobilityCase.findFirst.mockResolvedValue({
      id: "case_2",
      statusDefinitionId: "status_agreement_uploaded",
      statusDefinition: {
        key: "agreement_uploaded"
      }
    });
    prismaMock.caseStatusDefinition.findFirst.mockResolvedValue(null);
    prismaMock.__transaction.mobilityCaseDocument.findUnique.mockResolvedValue({
      id: "document_2",
      currentVersionId: "version_1",
      versions: [{ versionNumber: 1 }]
    });
    prismaMock.__transaction.mobilityCaseDocumentVersion.create.mockResolvedValue({
      id: "version_2",
      versionNumber: 2
    });

    const storage = new LocalFileStorage(storageRoot);
    const result = await uploadDocumentVersionForStaff(
      "staff_user",
      "case_2",
      "mobility_agreement",
      createUploadFile("agreement-v2.pdf", "agreement-v2"),
      storage
    );

    expect(result).toEqual({
      status: "uploaded",
      caseId: "case_2",
      documentId: "document_2",
      versionId: "version_2",
      currentStatusKey: "agreement_uploaded"
    });
    expect(prismaMock.__transaction.mobilityCaseDocument.create).not.toHaveBeenCalled();
    expect(prismaMock.__transaction.mobilityCaseDocumentVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          documentId: "document_2",
          versionNumber: 2,
          originalFilename: "agreement-v2.pdf"
        })
      })
    );
    expect(prismaMock.__transaction.mobilityCaseDocument.update).toHaveBeenCalledWith({
      where: {
        id: "document_2"
      },
      data: {
        currentVersionId: "version_2"
      }
    });
    expect(prismaMock.__transaction.mobilityCase.update).not.toHaveBeenCalled();
    expect(prismaMock.__transaction.mobilityCaseStatusHistory.create).not.toHaveBeenCalled();
    expect(prismaMock.__transaction.auditLog.create).toHaveBeenCalledTimes(2);
  });

  it("removes the stored file if metadata persistence fails", async () => {
    prismaMock.mobilityCase.findFirst.mockResolvedValue({
      id: "case_3",
      statusDefinitionId: "status_submitted",
      statusDefinition: {
        key: "submitted"
      }
    });
    prismaMock.caseStatusDefinition.findFirst.mockResolvedValue({
      id: "status_agreement_uploaded",
      key: "agreement_uploaded",
      label: "Agreement Uploaded"
    });
    prismaMock.__transaction.mobilityCaseDocument.findUnique.mockResolvedValue(null);
    prismaMock.__transaction.mobilityCaseDocument.create.mockRejectedValue(new Error("db write failed"));

    const storage = new LocalFileStorage(storageRoot);

    await expect(
      uploadDocumentVersionForStaff(
        "staff_user",
        "case_3",
        "mobility_agreement",
        createUploadFile("agreement-v1.pdf", "agreement-v1"),
        storage
      )
    ).rejects.toThrow("db write failed");

    await expect(listStoredFiles(storageRoot)).resolves.toEqual([]);
  });

  it("authorizes the owner download and returns stored metadata", async () => {
    const storageDriver = {
      read: vi.fn().mockResolvedValue(Buffer.from("agreement-pdf")),
      write: vi.fn(),
      delete: vi.fn()
    };

    prismaMock.mobilityCaseDocumentVersion.findFirst.mockResolvedValue({
      originalFilename: "agreement.pdf",
      mimeType: "application/pdf",
      storageKey: "case-documents/case_1/mobility_agreement/v1.pdf",
      document: {
        mobilityCase: {
          staffUserId: "staff_user"
        }
      }
    });

    const result = await authorizeDocumentDownload(
      "staff_user",
      UserRole.STAFF,
      "version_1",
      storageDriver
    );

    expect(result).toEqual({
      status: "ready",
      file: Buffer.from("agreement-pdf"),
      filename: "agreement.pdf",
      mimeType: "application/pdf"
    });
    expect(storageDriver.read).toHaveBeenCalledWith(
      "case-documents/case_1/mobility_agreement/v1.pdf"
    );
  });

  it("prevents other staff users from downloading someone else's document", async () => {
    const storageDriver = {
      read: vi.fn(),
      write: vi.fn(),
      delete: vi.fn()
    };

    prismaMock.mobilityCaseDocumentVersion.findFirst.mockResolvedValue({
      originalFilename: "agreement.pdf",
      mimeType: "application/pdf",
      storageKey: "case-documents/case_1/mobility_agreement/v1.pdf",
      document: {
        mobilityCase: {
          staffUserId: "owner_user"
        }
      }
    });

    const result = await authorizeDocumentDownload(
      "other_staff_user",
      UserRole.STAFF,
      "version_1",
      storageDriver
    );

    expect(result).toEqual({
      status: "not_found"
    });
    expect(storageDriver.read).not.toHaveBeenCalled();
  });

  it("reports a missing storage file when metadata exists but the file is gone", async () => {
    const storageDriver = {
      read: vi.fn().mockRejectedValue(Object.assign(new Error("missing"), { code: "ENOENT" })),
      write: vi.fn(),
      delete: vi.fn()
    };

    prismaMock.mobilityCaseDocumentVersion.findFirst.mockResolvedValue({
      originalFilename: "agreement.pdf",
      mimeType: "application/pdf",
      storageKey: "case-documents/case_1/mobility_agreement/v1.pdf",
      document: {
        mobilityCase: {
          staffUserId: "staff_user"
        }
      }
    });

    const result = await authorizeDocumentDownload(
      "staff_user",
      UserRole.STAFF,
      "version_1",
      storageDriver
    );

    expect(result).toEqual({
      status: "storage_missing"
    });
  });
});