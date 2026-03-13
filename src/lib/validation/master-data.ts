import { SelectOptionCategory } from "@prisma/client";
import { z } from "zod";
import { env } from "@/lib/env";

const uppercaseCodeSchema = z
  .string()
  .trim()
  .min(2, "Code is required")
  .max(40, "Code must be 40 characters or fewer")
  .regex(/^[A-Z0-9_-]+$/, "Use uppercase letters, numbers, hyphens, or underscores");

const lowercaseKeySchema = z
  .string()
  .trim()
  .min(2, "Key is required")
  .max(40, "Key must be 40 characters or fewer")
  .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, or underscores");

const labelSchema = z
  .string()
  .trim()
  .min(1, "Label is required")
  .max(120, "Label must be 120 characters or fewer");

export function normalizeExtensionList(value: string) {
  return value
    .split(",")
    .map((extension) => extension.trim().toLowerCase())
    .filter(Boolean);
}

export const facultySchema = z.object({
  code: uppercaseCodeSchema,
  name: z.string().trim().min(1, "Faculty name is required").max(120, "Faculty name must be 120 characters or fewer"),
  isActive: z.boolean()
});

export const departmentSchema = z.object({
  facultyId: z.string().trim().min(1, "Faculty is required"),
  code: uppercaseCodeSchema,
  name: z.string().trim().min(1, "Department name is required").max(120, "Department name must be 120 characters or fewer"),
  isActive: z.boolean()
});

export const academicYearSchema = z
  .object({
    label: z
      .string()
      .trim()
      .regex(/^\d{4}\/\d{4}$/, "Use the format YYYY/YYYY"),
    startYear: z.coerce.number().int("Start year must be a whole number").min(2020, "Start year must be 2020 or later").max(2100, "Start year must be 2100 or earlier"),
    endYear: z.coerce.number().int("End year must be a whole number").min(2021, "End year must be 2021 or later").max(2101, "End year must be 2101 or earlier"),
    sortOrder: z.coerce.number().int("Sort order must be a whole number").min(0, "Sort order must be 0 or greater"),
    isActive: z.boolean()
  })
  .refine((value) => value.endYear === value.startYear + 1, {
    path: ["endYear"],
    message: "End year must be exactly one year after the start year"
  })
  .refine((value) => value.label === `${value.startYear}/${value.endYear}`, {
    path: ["label"],
    message: "Label must match the selected start and end years"
  });

export const caseStatusDefinitionSchema = z.object({
  key: lowercaseKeySchema,
  label: labelSchema,
  description: z.string().trim().max(240, "Description must be 240 characters or fewer").optional().transform((value) => value && value.length > 0 ? value : null),
  sortOrder: z.coerce.number().int("Sort order must be a whole number").min(0, "Sort order must be 0 or greater"),
  isActive: z.boolean()
});

export const selectOptionSchema = z.object({
  category: z.nativeEnum(SelectOptionCategory),
  key: lowercaseKeySchema,
  label: labelSchema,
  sortOrder: z.coerce.number().int("Sort order must be a whole number").min(0, "Sort order must be 0 or greater"),
  isActive: z.boolean()
});

export const uploadSettingSchema = z.object({
  maxUploadSizeMb: z
    .coerce
    .number()
    .int("Maximum upload size must be a whole number")
    .positive("Maximum upload size must be greater than zero")
    .max(env.MAX_UPLOAD_SIZE_MB, `Maximum upload size cannot exceed the environment cap of ${env.MAX_UPLOAD_SIZE_MB} MB`),
  allowedExtensions: z
    .string()
    .trim()
    .min(1, "Allowed extensions are required")
    .transform(normalizeExtensionList)
    .refine((extensions) => extensions.length > 0, {
      message: "Provide at least one allowed extension"
    })
    .refine(
      (extensions) =>
        extensions.every((extension) => env.allowedUploadExtensions.includes(extension)),
      {
        message: `Allowed extensions must stay within the environment allowlist: ${env.allowedUploadExtensions.join(", ")}`
      }
    )
});

export const reportSettingSchema = z.object({
  summaryRowLimit: z
    .coerce
    .number()
    .int("Summary row limit must be a whole number")
    .min(3, "Summary row limit must be at least 3")
    .max(50, "Summary row limit must be 50 or fewer"),
  showHostInstitutionSummary: z.boolean(),
  showDocumentGapSummary: z.boolean()
});

export type FacultyInput = z.infer<typeof facultySchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type AcademicYearInput = z.infer<typeof academicYearSchema>;
export type CaseStatusDefinitionInput = z.infer<typeof caseStatusDefinitionSchema>;
export type SelectOptionInput = z.infer<typeof selectOptionSchema>;
export type UploadSettingInput = z.output<typeof uploadSettingSchema>;
export type ReportSettingInput = z.infer<typeof reportSettingSchema>;