import { Prisma } from "@prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { ensureReportSetting, updateReportSetting as persistReportSetting } from "@/lib/reporting/settings";
import type {
  AcademicYearInput,
  CaseStatusDefinitionInput,
  DepartmentInput,
  FacultyInput,
  ReportSettingInput,
  SelectOptionInput,
  UploadSettingInput
} from "@/lib/validation/master-data";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function ensureUploadSetting() {
  return prisma.uploadSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      maxUploadSizeMb: env.MAX_UPLOAD_SIZE_MB,
      allowedExtensions: env.allowedUploadExtensions.join(",")
    }
  });
}

export async function getMasterDataPageData() {
  const [uploadSetting, reportSetting, faculties, departments, academicYears, statuses, selectOptions] =
    await Promise.all([
      ensureUploadSetting(),
      ensureReportSetting(),
      prisma.faculty.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          isActive: true,
          departments: {
            select: {
              id: true,
              code: true,
              name: true,
              isActive: true,
              facultyId: true
            },
            orderBy: { name: "asc" }
          }
        },
        orderBy: { name: "asc" }
      }),
      prisma.department.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          isActive: true,
          facultyId: true,
          faculty: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [{ faculty: { name: "asc" } }, { name: "asc" }]
      }),
      prisma.academicYear.findMany({
        select: {
          id: true,
          label: true,
          startYear: true,
          endYear: true,
          sortOrder: true,
          isActive: true
        },
        orderBy: [{ sortOrder: "asc" }, { startYear: "asc" }]
      }),
      prisma.caseStatusDefinition.findMany({
        select: {
          id: true,
          key: true,
          label: true,
          description: true,
          sortOrder: true,
          isActive: true
        },
        orderBy: [{ sortOrder: "asc" }, { key: "asc" }]
      }),
      prisma.selectOption.findMany({
        select: {
          id: true,
          category: true,
          key: true,
          label: true,
          sortOrder: true,
          isActive: true
        },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { label: "asc" }]
      })
    ]);

  return {
    faculties,
    departments,
    academicYears,
    statuses,
    selectOptions,
    uploadSetting,
    reportSetting,
    uploadEnvironmentBounds: {
      maxUploadSizeMb: env.MAX_UPLOAD_SIZE_MB,
      allowedExtensions: env.allowedUploadExtensions
    }
  };
}

export async function createFaculty(input: FacultyInput) {
  try {
    const faculty = await prisma.faculty.create({
      data: input,
      select: { id: true }
    });

    return { status: "created" as const, facultyId: faculty.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" as const, message: "Faculty code or name already exists." };
    }

    throw error;
  }
}

export async function updateFaculty(id: string, input: FacultyInput) {
  try {
    await prisma.faculty.update({
      where: { id },
      data: input
    });

    return { status: "updated" as const };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" as const, message: "Faculty code or name already exists." };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { status: "not_found" as const, message: "Faculty record was not found." };
    }

    throw error;
  }
}

export async function createDepartment(input: DepartmentInput) {
  const faculty = await prisma.faculty.findUnique({
    where: { id: input.facultyId },
    select: { id: true }
  });

  if (!faculty) {
    return { status: "invalid_faculty" as const, message: "Select a valid faculty before saving the department." };
  }

  try {
    const department = await prisma.department.create({
      data: input,
      select: { id: true }
    });

    return { status: "created" as const, departmentId: department.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" as const, message: "Department code or faculty/name combination already exists." };
    }

    throw error;
  }
}

export async function updateDepartment(id: string, input: DepartmentInput) {
  const faculty = await prisma.faculty.findUnique({
    where: { id: input.facultyId },
    select: { id: true }
  });

  if (!faculty) {
    return { status: "invalid_faculty" as const, message: "Select a valid faculty before saving the department." };
  }

  try {
    await prisma.department.update({
      where: { id },
      data: input
    });

    return { status: "updated" as const };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" as const, message: "Department code or faculty/name combination already exists." };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { status: "not_found" as const, message: "Department record was not found." };
    }

    throw error;
  }
}

export async function createAcademicYear(input: AcademicYearInput) {
  try {
    const academicYear = await prisma.academicYear.create({
      data: input,
      select: { id: true }
    });

    return { status: "created" as const, academicYearId: academicYear.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" as const, message: "Academic year label already exists." };
    }

    throw error;
  }
}

export async function updateAcademicYear(id: string, input: AcademicYearInput) {
  try {
    await prisma.academicYear.update({
      where: { id },
      data: input
    });

    return { status: "updated" as const };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" as const, message: "Academic year label already exists." };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { status: "not_found" as const, message: "Academic year record was not found." };
    }

    throw error;
  }
}

export async function createCaseStatusDefinition(input: CaseStatusDefinitionInput) {
  try {
    const status = await prisma.caseStatusDefinition.create({
      data: input,
      select: { id: true }
    });

    return { status: "created" as const, statusId: status.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" as const, message: "Status key already exists." };
    }

    throw error;
  }
}

export async function updateCaseStatusDefinition(id: string, input: CaseStatusDefinitionInput) {
  try {
    await prisma.caseStatusDefinition.update({
      where: { id },
      data: input
    });

    return { status: "updated" as const };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" as const, message: "Status key already exists." };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { status: "not_found" as const, message: "Status record was not found." };
    }

    throw error;
  }
}

export async function createSelectOption(input: SelectOptionInput) {
  try {
    const option = await prisma.selectOption.create({
      data: input,
      select: { id: true }
    });

    return { status: "created" as const, optionId: option.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" as const, message: "Select-list key or label already exists in this category." };
    }

    throw error;
  }
}

export async function updateSelectOption(id: string, input: SelectOptionInput) {
  try {
    await prisma.selectOption.update({
      where: { id },
      data: input
    });

    return { status: "updated" as const };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "duplicate" as const, message: "Select-list key or label already exists in this category." };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { status: "not_found" as const, message: "Select-list record was not found." };
    }

    throw error;
  }
}

export async function updateUploadSetting(input: UploadSettingInput) {
  await prisma.uploadSetting.upsert({
    where: { id: "default" },
    update: {
      maxUploadSizeMb: input.maxUploadSizeMb,
      allowedExtensions: input.allowedExtensions.join(",")
    },
    create: {
      id: "default",
      maxUploadSizeMb: input.maxUploadSizeMb,
      allowedExtensions: input.allowedExtensions.join(",")
    }
  });

  return { status: "updated" as const };
}

export async function updateReportSetting(input: ReportSettingInput) {
  return persistReportSetting(input);
}