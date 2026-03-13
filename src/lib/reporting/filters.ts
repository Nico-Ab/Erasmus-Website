import { Prisma } from "@prisma/client";
import { z } from "zod";

const filterIdSchema = z.string().trim().max(191).optional().default("");
const filterTextSchema = z.string().trim().max(160).optional().default("");

type RawSearchParams = URLSearchParams | Record<string, string | string[] | undefined>;

export const reportingFiltersSchema = z.object({
  academicYearId: filterIdSchema,
  facultyId: filterIdSchema,
  departmentId: filterIdSchema,
  mobilityTypeOptionId: filterIdSchema,
  country: z.string().trim().max(120).optional().default(""),
  hostInstitution: filterTextSchema,
  statusDefinitionId: filterIdSchema
});

export type ReportingFiltersInput = z.infer<typeof reportingFiltersSchema>;

function readSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function parseReportingFilters(searchParams: RawSearchParams): ReportingFiltersInput {
  if (searchParams instanceof URLSearchParams) {
    return reportingFiltersSchema.parse({
      academicYearId: searchParams.get("academicYearId") ?? "",
      facultyId: searchParams.get("facultyId") ?? "",
      departmentId: searchParams.get("departmentId") ?? "",
      mobilityTypeOptionId: searchParams.get("mobilityTypeOptionId") ?? "",
      country: searchParams.get("country") ?? "",
      hostInstitution: searchParams.get("hostInstitution") ?? "",
      statusDefinitionId: searchParams.get("statusDefinitionId") ?? ""
    });
  }

  return reportingFiltersSchema.parse({
    academicYearId: readSingleValue(searchParams.academicYearId),
    facultyId: readSingleValue(searchParams.facultyId),
    departmentId: readSingleValue(searchParams.departmentId),
    mobilityTypeOptionId: readSingleValue(searchParams.mobilityTypeOptionId),
    country: readSingleValue(searchParams.country),
    hostInstitution: readSingleValue(searchParams.hostInstitution),
    statusDefinitionId: readSingleValue(searchParams.statusDefinitionId)
  });
}

export function buildReportingQueryString(filters: ReportingFiltersInput) {
  const params = new URLSearchParams();

  if (filters.academicYearId) {
    params.set("academicYearId", filters.academicYearId);
  }

  if (filters.facultyId) {
    params.set("facultyId", filters.facultyId);
  }

  if (filters.departmentId) {
    params.set("departmentId", filters.departmentId);
  }

  if (filters.mobilityTypeOptionId) {
    params.set("mobilityTypeOptionId", filters.mobilityTypeOptionId);
  }

  if (filters.country) {
    params.set("country", filters.country);
  }

  if (filters.hostInstitution) {
    params.set("hostInstitution", filters.hostInstitution);
  }

  if (filters.statusDefinitionId) {
    params.set("statusDefinitionId", filters.statusDefinitionId);
  }

  return params.toString();
}

export function buildReportingCaseWhere(filters: ReportingFiltersInput): Prisma.MobilityCaseWhereInput {
  const conditions: Prisma.MobilityCaseWhereInput[] = [];

  if (filters.statusDefinitionId) {
    conditions.push({ statusDefinitionId: filters.statusDefinitionId });
  }

  if (filters.academicYearId) {
    conditions.push({ academicYearId: filters.academicYearId });
  }

  if (filters.facultyId) {
    conditions.push({
      staffUser: {
        facultyId: filters.facultyId
      }
    });
  }

  if (filters.departmentId) {
    conditions.push({
      staffUser: {
        departmentId: filters.departmentId
      }
    });
  }

  if (filters.mobilityTypeOptionId) {
    conditions.push({ mobilityTypeOptionId: filters.mobilityTypeOptionId });
  }

  if (filters.country) {
    conditions.push({
      hostCountry: {
        contains: filters.country,
        mode: "insensitive"
      }
    });
  }

  if (filters.hostInstitution) {
    conditions.push({
      hostInstitution: {
        contains: filters.hostInstitution,
        mode: "insensitive"
      }
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}