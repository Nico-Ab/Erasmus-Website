import { describe, expect, it } from "vitest";
import {
  formatAllowedExtensionsLabel,
  getFileExtension,
  normalizeOriginalFilename,
  validateDocumentUploadFile
} from "@/lib/validation/documents";

describe("document upload validation", () => {
  it("accepts allowed files within the configured size limit", () => {
    const file = new File(["agreement"], "mobility-agreement.pdf", {
      type: "application/pdf"
    });
    const result = validateDocumentUploadFile(file, {
      maxUploadSizeMb: 5,
      allowedExtensions: ["pdf", "docx"]
    });

    expect(result).toEqual({
      success: true,
      data: {
        originalFilename: "mobility-agreement.pdf",
        fileExtension: "pdf",
        mimeType: "application/pdf",
        sizeBytes: file.size
      }
    });
  });

  it("rejects unsupported file extensions", () => {
    const file = new File(["agreement"], "mobility-agreement.exe", {
      type: "application/octet-stream"
    });
    const result = validateDocumentUploadFile(file, {
      maxUploadSizeMb: 5,
      allowedExtensions: ["pdf", "docx"]
    });

    expect(result).toEqual({
      success: false,
      message: "Upload a supported file type: PDF, DOCX."
    });
  });

  it("rejects files that exceed the configured size limit", () => {
    const file = new File([new Uint8Array(2 * 1024 * 1024)], "large.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    const result = validateDocumentUploadFile(file, {
      maxUploadSizeMb: 1,
      allowedExtensions: ["pdf", "docx"]
    });

    expect(result).toEqual({
      success: false,
      message: "Files must be 1 MB or smaller."
    });
  });

  it("rejects empty files", () => {
    const file = new File([], "empty.pdf", {
      type: "application/pdf"
    });
    const result = validateDocumentUploadFile(file, {
      maxUploadSizeMb: 5,
      allowedExtensions: ["pdf", "docx"]
    });

    expect(result).toEqual({
      success: false,
      message: "Uploaded files must not be empty."
    });
  });

  it("normalizes original filenames and file extensions", () => {
    expect(normalizeOriginalFilename("folder\\agreement.PDF")).toBe("folder_agreement.PDF");
    expect(getFileExtension("folder\\agreement.PDF")).toBe("pdf");
    expect(formatAllowedExtensionsLabel(["pdf", "docx"])).toBe("PDF, DOCX");
  });
});