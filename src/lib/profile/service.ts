import { SelectOptionCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProfileInput } from "@/lib/validation/profile";

const editableUserSelect = {
  id: true,
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
      name: true
    }
  },
  department: {
    select: {
      id: true,
      name: true,
      facultyId: true
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
  const [user, academicTitleOptions, faculties] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: editableUserSelect
    }),
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
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        departments: {
          where: { isActive: true },
          select: {
            id: true,
            code: true,
            name: true,
            facultyId: true
          },
          orderBy: { name: "asc" }
        }
      },
      orderBy: { name: "asc" }
    })
  ]);

  if (!user) {
    return null;
  }

  return {
    user,
    academicTitleOptions,
    faculties
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

  const [user, academicTitleOption, faculty, department, emailOwner] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
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
        id: input.facultyId,
        isActive: true
      },
      select: { id: true }
    }),
    prisma.department.findFirst({
      where: {
        id: input.departmentId,
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

  if (!faculty) {
    return { status: "invalid_faculty" as const };
  }

  if (!department) {
    return { status: "invalid_department" as const };
  }

  if (department.facultyId !== faculty.id) {
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
      facultyId: faculty.id,
      departmentId: department.id
    },
    select: profileSummarySelect
  });

  return {
    status: "updated" as const,
    user: updatedUser
  };
}