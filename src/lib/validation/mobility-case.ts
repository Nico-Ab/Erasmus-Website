import { z } from "zod";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function addRequiredIssue(
  ctx: z.RefinementCtx,
  path: keyof MobilityCaseFormValues,
  message: string
) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: [path],
    message
  });
}

function isValidIsoDate(value: string) {
  if (!isoDatePattern.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateDateFields(value: MobilityCaseFormValues, ctx: z.RefinementCtx) {
  if (value.startDate && !isValidIsoDate(value.startDate)) {
    addRequiredIssue(ctx, "startDate", "Enter a valid start date");
  }

  if (value.endDate && !isValidIsoDate(value.endDate)) {
    addRequiredIssue(ctx, "endDate", "Enter a valid end date");
  }

  if (
    value.startDate &&
    value.endDate &&
    isValidIsoDate(value.startDate) &&
    isValidIsoDate(value.endDate) &&
    value.endDate < value.startDate
  ) {
    addRequiredIssue(ctx, "endDate", "End date must be the same as or later than the start date");
  }
}

export const mobilityCaseDraftSchema = z
  .object({
    academicYearId: z.string().trim(),
    mobilityTypeOptionId: z.string().trim(),
    hostInstitution: z
      .string()
      .trim()
      .max(160, "Host institution must be 160 characters or fewer"),
    hostCountry: z.string().trim().max(120, "Host country must be 120 characters or fewer"),
    hostCity: z.string().trim().max(120, "Host city must be 120 characters or fewer"),
    startDate: z.string().trim(),
    endDate: z.string().trim(),
    notes: z.string().trim().max(2000, "Notes must be 2000 characters or fewer")
  })
  .superRefine((value, ctx) => {
    validateDateFields(value, ctx);
  });

export const mobilityCaseSubmitSchema = mobilityCaseDraftSchema.superRefine((value, ctx) => {
  if (!value.academicYearId) {
    addRequiredIssue(ctx, "academicYearId", "Academic year is required");
  }

  if (!value.mobilityTypeOptionId) {
    addRequiredIssue(ctx, "mobilityTypeOptionId", "Mobility type is required");
  }

  if (!value.hostInstitution) {
    addRequiredIssue(ctx, "hostInstitution", "Host institution is required");
  }

  if (!value.hostCountry) {
    addRequiredIssue(ctx, "hostCountry", "Host country is required");
  }

  if (!value.hostCity) {
    addRequiredIssue(ctx, "hostCity", "Host city is required");
  }

  if (!value.startDate) {
    addRequiredIssue(ctx, "startDate", "Start date is required");
  }

  if (!value.endDate) {
    addRequiredIssue(ctx, "endDate", "End date is required");
  }
});

export const mobilityCaseMutationSchema = mobilityCaseDraftSchema.extend({
  intent: z.enum(["saveDraft", "submit"])
});

export type MobilityCaseFormValues = z.infer<typeof mobilityCaseDraftSchema>;
export type MobilityCaseMutationInput = z.infer<typeof mobilityCaseMutationSchema>;
export type MobilityCaseIntent = MobilityCaseMutationInput["intent"];