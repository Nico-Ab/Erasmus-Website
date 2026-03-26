import { SelectOptionCategory, UserRole } from "@prisma/client";
import { isOfficialSwuFacultyCode, swuFacultyCodes } from "@/lib/master-data/swu-faculties";
import { prisma } from "@/lib/prisma";
import type { ProfileInput } from "@/lib/validation/profile";

const editableUserSelect = {
  id: true,
  role: true,
  firstName: true,
  lastName: true,
  email: true,
  academicTitleOptionId: true,
  facultyId: true,
  departmentId: true,
  academicTitleOption: {
    select: {
      id: true,
      label: true
    }
  },
  faculty: {
    select: {
      id: true,
      code: true,
      name: true,
      isActive: true
    }
  },
  department: {
    select: {
      id: true,
      name: true,
      facultyId: true,
      isActive: true
    }
  }
} as const;

const profileSummarySelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  faculty: {
    select: {
      id: true,
      name: true
    }
  },
  department: {
    select: {
      id: true,
      name: true
    }
  },
  academicTitleOption: {
    select: {
      id: true,
      label: true
    }
  }
} as const;

export async function getEditableProfileData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: editableUserSelect
  });

  if (!user) {
    return null;
  }

  const facultyWhere = user.facultyId
    ? {
        OR: [
          {
            code: {
              in: swuFacultyCodes
            },
            isActive: true
          },
          { id: user.facultyId }
        ]
      }
    : {
        code: {
          in: swuFacultyCodes
        },
        isActive: true
      };

  const [academicTitleOptions, selectableFaculties] = await Promise.all([
    prisma.selectOption.findMany({
      where: {
        category: SelectOptionCategory.ACADEMIC_TITLE,
        isActive: true
      },
      select: {
        id: true,
        key: true,
        label: true
      },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
    }),
    prisma.faculty.findMany({
      where: facultyWhere,
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
        departments: {
          where: user.departmentId
            ? {
                OR: [{ isActive: true }, { id: user.departmentId }]
              }
            : { isActive: true },
          select: {
            id: true,
            code: true,
            name: true,
            facultyId: true,
            isActive: true
          },
          orderBy: { name: "asc" }
        }
      },
      orderBy: { name: "asc" }
    })
  ]);

  const hasActiveCurrentDepartment = user.departmentId
    ? selectableFaculties.some((faculty) =>
        faculty.departments.some((department) => department.id === user.departmentId && department.isActive)
      )
    : false;

  return {
    user,
    academicTitleOptions,
    faculties: selectableFaculties.map((faculty) => ({
      id: faculty.id,
      code: faculty.code,
      name: faculty.name,
      isLegacy: !faculty.isActive || !isOfficialSwuFacultyCode(faculty.code),
      departments: faculty.departments.map((department) => ({
        id: department.id,
        code: department.code,
        name: department.name,
        facultyId: department.facultyId,
        isLegacy: !department.isActive
      }))
    })),
    legacySelection: {
      hasLegacyFaculty:
        Boolean(user.facultyId) &&
        (!user.faculty || !user.faculty.isActive || !isOfficialSwuFacultyCode(user.faculty.code)),
      hasLegacyDepartment:
        Boolean(user.departmentId) &&
        (!user.department || !user.department.isActive || !hasActiveCurrentDepartment)
    }
  };
}

export async function getProfileSummary(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: profileSummarySelect
  });
}

export async function updateOwnProfile(userId: string, input: ProfileInput) {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const facultyId = input.facultyId.trim() || null;
  const departmentId = input.departmentId.trim() || null;

  const [user, academicTitleOption, faculty, department, emailOwner] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    }),
    prisma.selectOption.findFirst({
      where: {
        id: input.academicTitleOptionId,
        category: SelectOptionCategory.ACADEMIC_TITLE,
        isActive: true
      },
      select: { id: true }
    }),
    prisma.faculty.findFirst({
      where: {
        id: facultyId ?? "",
        isActive: true
      },
      select: { id: true }
    }),
    prisma.department.findFirst({
      where: {
        id: departmentId ?? "",
        isActive: true
      },
      select: {
        id: true,
        facultyId: true
      }
    }),
    prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })
  ]);

  if (!user) {
    return { status: "not_found" as const };
  }

  if (emailOwner && emailOwner.id !== userId) {
    return { status: "email_in_use" as const };
  }

  if (!academicTitleOption) {
    return { status: "invalid_academic_title" as const };
  }

  if (user.role === UserRole.STAFF && !facultyId) {
    return { status: "faculty_required" as const };
  }

  if (facultyId && !faculty) {
    return { status: "invalid_faculty" as const };
  }

  if (!facultyId && departmentId) {
    return { status: "department_requires_faculty" as const };
  }

  if (departmentId && !department) {
    return { status: "invalid_department" as const };
  }

  if (faculty && department && department.facultyId !== faculty.id) {
    return { status: "department_mismatch" as const };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      academicTitleOptionId: academicTitleOption.id,
      facultyId,
      departmentId
    },
    select: profileSummarySelect
  });

  return {
    status: "updated" as const,
    user: updatedUser
  };
}
