import { UserApprovalStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authErrorCodes } from "@/lib/auth/error-codes";
import { authenticateCredentials, registerStaffUser } from "@/lib/auth/service";
import { createLoginInput, createRegistrationInput } from "../factories/auth";

const { bcryptCompareMock, bcryptHashMock, prismaUserMocks } = vi.hoisted(() => ({
  bcryptCompareMock: vi.fn(),
  bcryptHashMock: vi.fn(),
  prismaUserMocks: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn()
  }
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: bcryptCompareMock,
    hash: bcryptHashMock
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: prismaUserMocks
  }
}));

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the pending approval status for matching pending users", async () => {
    prismaUserMocks.findUnique.mockResolvedValue({
      id: "user_pending",
      email: "pending.staff@swu.local",
      name: "Pending Staff",
      firstName: "Pending",
      lastName: "Staff",
      role: UserRole.STAFF,
      status: UserApprovalStatus.PENDING,
      passwordHash: "hashed-password"
    });
    bcryptCompareMock.mockResolvedValue(true);

    const result = await authenticateCredentials(
      createLoginInput({ email: "pending.staff@swu.local" })
    );

    expect(result).toEqual({ status: authErrorCodes.pendingApproval });
  });

  it("returns the approved user payload for matching approved users", async () => {
    prismaUserMocks.findUnique.mockResolvedValue({
      id: "user_approved",
      email: "staff@swu.local",
      name: "Elena Petrova",
      firstName: "Elena",
      lastName: "Petrova",
      role: UserRole.STAFF,
      status: UserApprovalStatus.APPROVED,
      passwordHash: "hashed-password"
    });
    bcryptCompareMock.mockResolvedValue(true);

    const result = await authenticateCredentials(createLoginInput());

    expect(result).toMatchObject({
      status: "approved",
      user: {
        id: "user_approved",
        email: "staff@swu.local",
        role: UserRole.STAFF,
        status: UserApprovalStatus.APPROVED
      }
    });
  });

  it("rejects duplicate registration emails", async () => {
    prismaUserMocks.findUnique.mockResolvedValue({ id: "existing_user" });

    const result = await registerStaffUser(createRegistrationInput());

    expect(result).toEqual({ status: "email_in_use" });
    expect(prismaUserMocks.create).not.toHaveBeenCalled();
  });

  it("creates new staff registrations in the pending state", async () => {
    prismaUserMocks.findUnique.mockResolvedValue(null);
    bcryptHashMock.mockResolvedValue("hashed-password");
    prismaUserMocks.create.mockResolvedValue({
      id: "new_user",
      email: "new.staff@swu.local"
    });

    const result = await registerStaffUser(
      createRegistrationInput({ email: " New.Staff@swu.local " })
    );

    expect(bcryptHashMock).toHaveBeenCalledWith("NewStaffPass123!", 12);
    expect(prismaUserMocks.create).toHaveBeenCalledWith({
      data: {
        email: "new.staff@swu.local",
        firstName: "Elena",
        lastName: "Petrova",
        name: "Elena Petrova",
        passwordHash: "hashed-password",
        role: UserRole.STAFF,
        status: UserApprovalStatus.PENDING
      },
      select: {
        id: true,
        email: true
      }
    });
    expect(result).toEqual({
      status: "registered",
      userId: "new_user",
      email: "new.staff@swu.local"
    });
  });
});