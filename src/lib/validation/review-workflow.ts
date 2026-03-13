import { z } from "zod";
import { documentTypeKeySchema } from "@/lib/validation/documents";

const filterIdSchema = z.string().trim().max(191).optional().default("");
const filterTextSchema = z.string().trim().max(160).optional().default("");

export const reviewCaseFiltersSchema = z.object({
  search: z.string().trim().max(160).optional().default(""),
  statusDefinitionId: filterIdSchema,
  academicYearId: filterIdSchema,
  facultyId: filterIdSchema,
  departmentId: filterIdSchema,
  mobilityTypeOptionId: filterIdSchema,
  country: z.string().trim().max(120).optional().default(""),
  hostInstitution: filterTextSchema
});

export type ReviewCaseFiltersInput = z.infer<typeof reviewCaseFiltersSchema>;

export const reviewCaseStatusSchema = z.object({
  nextStatusKey: z.string().trim().min(1, "Select a target status.").max(64),
  note: z.string().trim().max(500, "Status notes must be 500 characters or fewer.").optional().default("")
});

export const reviewCaseCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Comment is required.")
    .max(2000, "Comments must be 2000 characters or fewer.")
});

export const reviewDocumentDecisionSchema = z
  .object({
    versionId: z.string().trim().min(1, "Select a document version."),
    decision: z.enum(["accept", "reject"]),
    reason: z
      .string()
      .trim()
      .max(1000, "Review notes must be 1000 characters or fewer.")
      .optional()
      .default("")
  })
  .superRefine((value, context) => {
    if (value.decision === "reject" && value.reason.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide a reason when rejecting a document.",
        path: ["reason"]
      });
    }
  });

export const markMissingDocumentSchema = z.object({
  documentTypeKey: documentTypeKeySchema,
  note: z
    .string()
    .trim()
    .max(500, "Missing-document notes must be 500 characters or fewer.")
    .optional()
    .default("")
});