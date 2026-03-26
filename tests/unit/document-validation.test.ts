import { describe, expect, it } from "vitest";
import {
  formatAllowedExtensionsLabel,
  getFileExtension,
  normalizeOriginalFilename,
  validateDocumentUploadBuffer,
  validateDocumentUploadFile
} from "@/lib/validation/documents";

function createPdfBytes(content = "agreement") {
  return new TextEncoder().encode(`%PDF-1.4\n${content}\n%%EOF`);
}

function createDocxBytes(content = "agreement") {
  return new TextEncoder().encode(`PK\u0003\u0004[Content_Types].xml word/document.xml ${content}`);
}

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

  it("rejects files with a mismatched declared mime type", () => {
    const file = new File([createPdfBytes()], "mobility-agreement.pdf", {
      type: "application/x-msdownload"
    });
    const result = validateDocumentUploadFile(file, {
      maxUploadSizeMb: 5,
      allowedExtensions: ["pdf", "docx"]
    });

    expect(result).toEqual({
      success: false,
      message: "The uploaded file type does not match the selected document format."
    });
  });

  it("rejects pdf buffers that do not match the pdf signature", () => {
    const result = validateDocumentUploadBuffer(
      new TextEncoder().encode("MZ fake executable"),
      "pdf",
      "application/pdf"
    );

    expect(result).toEqual({
      success: false,
      message: "The uploaded file content does not match a PDF document."
    });
  });

  it("rejects pdf buffers with active content markers", () => {
    const result = validateDocumentUploadBuffer(
      createPdfBytes("/JavaScript /OpenAction"),
      "pdf",
      "application/pdf"
    );

    expect(result).toEqual({
      success: false,
      message: "PDF files with active content or embedded attachments are not allowed."
    });
  });

  it("rejects docx buffers that do not contain the expected Word structure", () => {
    const result = validateDocumentUploadBuffer(
      new TextEncoder().encode("PK\u0003\u0004not-a-word-document"),
      "docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    expect(result).toEqual({
      success: false,
      message: "The uploaded file content does not match a Word document."
    });
  });

  it("rejects docx buffers with embedded macros or objects", () => {
    const result = validateDocumentUploadBuffer(
      createDocxBytes("word/vbaProject.bin"),
      "docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    expect(result).toEqual({
      success: false,
      message: "Macro-enabled or embedded-object Word files are not allowed."
    });
  });
});
