import { z } from "zod";
import { requiredDocumentTypeDefinitions } from "@/lib/documents/constants";

export type DocumentUploadPolicy = {
  maxUploadSizeMb: number;
  allowedExtensions: string[];
};

export type DocumentFileValidationResult =
  | {
      success: true;
      data: {
        originalFilename: string;
        fileExtension: string;
        mimeType: string | null;
        sizeBytes: number;
      };
    }
  | {
      success: false;
      message: string;
    };

export type DocumentBufferValidationResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

const declaredMimeTypesByExtension: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword", "application/doc", "application/vnd.ms-office"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
};

const pdfSignature = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
const docSignature = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const zipSignature = new Uint8Array([0x50, 0x4b]);
const unsafePdfMarkers = [
  "/javascript",
  "/js",
  "/aa",
  "/openaction",
  "/launch",
  "/embeddedfile",
  "/richmedia",
  "/xfa"
];
const unsafeDocxMarkers = ["word/vbaproject.bin", "activex/", "embeddings/"];

export const documentTypeKeySchema = z.enum(
  requiredDocumentTypeDefinitions.map((definition) => definition.key) as [
    (typeof requiredDocumentTypeDefinitions)[number]["key"],
    ...(typeof requiredDocumentTypeDefinitions)[number]["key"][]
  ]
);

export function normalizeOriginalFilename(value: string) {
  return value.replace(/[\\/]+/g, "_").replace(/[\u0000-\u001f\u007f]+/g, "").trim();
}

export function getFileExtension(filename: string) {
  const normalizedFilename = normalizeOriginalFilename(filename);
  const lastDotIndex = normalizedFilename.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === normalizedFilename.length - 1) {
    return "";
  }

  return normalizedFilename.slice(lastDotIndex + 1).toLowerCase();
}

export function formatAllowedExtensionsLabel(extensions: string[]) {
  return extensions.map((extension) => extension.toUpperCase()).join(", ");
}

function startsWithSignature(buffer: Uint8Array, signature: Uint8Array) {
  if (buffer.byteLength < signature.byteLength) {
    return false;
  }

  return signature.every((value, index) => buffer[index] === value);
}

function getBinaryText(buffer: Uint8Array) {
  return Buffer.from(buffer).toString("latin1").toLowerCase();
}

function hasAllowedDeclaredMimeType(fileExtension: string, mimeType: string | null) {
  if (!mimeType) {
    return true;
  }

  const normalizedMimeType = mimeType.trim().toLowerCase();
  const allowedMimeTypes = declaredMimeTypesByExtension[fileExtension];

  if (!allowedMimeTypes) {
    return false;
  }

  return allowedMimeTypes.includes(normalizedMimeType);
}

export function validateDocumentUploadBuffer(
  buffer: Uint8Array,
  fileExtension: string,
  mimeType: string | null
): DocumentBufferValidationResult {
  if (!hasAllowedDeclaredMimeType(fileExtension, mimeType)) {
    return {
      success: false,
      message: "The uploaded file type does not match the selected document format."
    };
  }

  if (fileExtension === "pdf") {
    if (!startsWithSignature(buffer, pdfSignature)) {
      return {
        success: false,
        message: "The uploaded file content does not match a PDF document."
      };
    }

    const binaryText = getBinaryText(buffer);

    if (unsafePdfMarkers.some((marker) => binaryText.includes(marker))) {
      return {
        success: false,
        message: "PDF files with active content or embedded attachments are not allowed."
      };
    }

    return { success: true };
  }

  if (fileExtension === "doc") {
    if (!startsWithSignature(buffer, docSignature)) {
      return {
        success: false,
        message: "The uploaded file content does not match a legacy Word document."
      };
    }

    return { success: true };
  }

  if (fileExtension === "docx") {
    if (!startsWithSignature(buffer, zipSignature)) {
      return {
        success: false,
        message: "The uploaded file content does not match a Word document."
      };
    }

    const binaryText = getBinaryText(buffer);
    const looksLikeDocx =
      binaryText.includes("[content_types].xml") && binaryText.includes("word/");

    if (!looksLikeDocx) {
      return {
        success: false,
        message: "The uploaded file content does not match a Word document."
      };
    }

    if (unsafeDocxMarkers.some((marker) => binaryText.includes(marker))) {
      return {
        success: false,
        message: "Macro-enabled or embedded-object Word files are not allowed."
      };
    }

    return { success: true };
  }

  return {
    success: false,
    message: "The uploaded file content could not be verified."
  };
}

export function validateDocumentUploadFile(file: File, policy: DocumentUploadPolicy): DocumentFileValidationResult {
  const originalFilename = normalizeOriginalFilename(file.name);

  if (!originalFilename) {
    return {
      success: false,
      message: "Choose a file to upload."
    };
  }

  const fileExtension = getFileExtension(originalFilename);

  if (!fileExtension || !policy.allowedExtensions.includes(fileExtension)) {
    return {
      success: false,
      message: `Upload a supported file type: ${formatAllowedExtensionsLabel(policy.allowedExtensions)}.`
    };
  }

  if (file.size <= 0) {
    return {
      success: false,
      message: "Uploaded files must not be empty."
    };
  }

  const maxUploadSizeBytes = policy.maxUploadSizeMb * 1024 * 1024;

  if (file.size > maxUploadSizeBytes) {
    return {
      success: false,
      message: `Files must be ${policy.maxUploadSizeMb} MB or smaller.`
    };
  }

  const mimeType = file.type.trim() ? file.type : null;

  if (!hasAllowedDeclaredMimeType(fileExtension, mimeType)) {
    return {
      success: false,
      message: "The uploaded file type does not match the selected document format."
    };
  }

  return {
    success: true,
    data: {
      originalFilename,
      fileExtension,
      mimeType,
      sizeBytes: file.size
    }
  };
}
