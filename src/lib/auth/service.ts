import bcrypt from "bcryptjs";
import { Prisma, UserApprovalStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { LoginInput, RegistrationInput } from "@/lib/validation/auth";
import { authErrorCodes } from "@/lib/auth/error-codes";

const authUserSelect = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  passwordHash: true
} satisfies Prisma.UserSelect;

type AuthUser = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;
type ReviewableRegistrationStatus = "APPROVED" | "REJECTED";

type ApprovedAuthenticationResult = {
  status: "approved";
  user: AuthUser;
};

type FailedAuthenticationResult = {
  status:
    | typeof authErrorCodes.invalidCredentials
    | typeof authErrorCodes.pendingApproval
    | typeof authErrorCodes.accountRejected
    | typeof authErrorCodes.accountDeactivated;
};

export type AuthenticationResult = ApprovedAuthenticationResult | FailedAuthenticationResult;

export async function authenticateCredentials(input: LoginInput): Promise<AuthenticationResult> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: authUserSelect
  });

  if (!user?.passwordHash) {
    return { status: authErrorCodes.invalidCredentials };
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    return { status: authErrorCodes.invalidCredentials };
  }

  if (user.status === UserApprovalStatus.PENDING) {
    return { status: authErrorCodes.pendingApproval };
  }

  if (user.status === UserApprovalStatus.REJECTED) {
    return { status: authErrorCodes.accountRejected };
  }

  if (user.status === UserApprovalStatus.DEACTIVATED) {
    return { status: authErrorCodes.accountDeactivated };
  }

  return {
    status: "approved",
    user
  };
}

export type RegistrationResult =
  | {
      status: "registered";
      userId: string;
      email: string;
    }
  | {
      status: "email_in_use";
    };

export async function registerStaffUser(input: RegistrationInput): Promise<RegistrationResult> {
  const email = input.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    return { status: "email_in_use" };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      name: `${input.firstName.trim()} ${input.lastName.trim()}`,
      passwordHash,
      role: UserRole.STAFF,
      status: UserApprovalStatus.PENDING
    },
    select: {
      id: true,
      email: true
    }
  });

  return {
    status: "registered",
    userId: user.id,
    email: user.email
  };
}

export async function getAdminUserManagementData() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      reviewedAt: true
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  return {
    users,
    pendingCount: users.filter((user) => user.status === UserApprovalStatus.PENDING).length
  };
}

export async function updateRegistrationStatus(params: {
  adminUserId: string;
  userId: string;
  status: ReviewableRegistrationStatus;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      role: true,
      status: true
    }
  });

  if (!user || user.role !== UserRole.STAFF) {
    return { status: "not_found" as const };
  }

  if (user.status === params.status) {
    return { status: "unchanged" as const };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      status: params.status,
      reviewedAt: new Date(),
      reviewedById: params.adminUserId
    }
  });

  return { status: "updated" as const };
}