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

export const documentTypeKeySchema = z.enum(
  requiredDocumentTypeDefinitions.map((definition) => definition.key) as [
    (typeof requiredDocumentTypeDefinitions)[number]["key"],
    ...(typeof requiredDocumentTypeDefinitions)[number]["key"][]
  ]
);

export function normalizeOriginalFilename(value: string) {
  return value.replace(/[\\/]+/g, "_").trim();
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

  return {
    success: true,
    data: {
      originalFilename,
      fileExtension,
      mimeType: file.type.trim() ? file.type : null,
      sizeBytes: file.size
    }
  };
}