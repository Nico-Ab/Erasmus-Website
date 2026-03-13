import { UserApprovalStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authErrorCodes } from "@/lib/auth/error-codes";
import { authenticateCredentials, registerStaffUser } from "@/lib/auth/service";
import { createLoginInput, createRegistrationInput } from "../factories/auth";

const { bcryptCompareMock, bcryptHashMock, prismaMock } = vi.hoisted(() => {
  const transactionMock = {
    user: {
      create: vi.fn(),
      update: vi.fn()
    },
    auditLog: {
      create: vi.fn()
    }
  };

  return {
    bcryptCompareMock: vi.fn(),
    bcryptHashMock: vi.fn(),
    prismaMock: {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn()
      },
      $transaction: vi.fn(async (callback: (client: typeof transactionMock) => unknown) =>
        callback(transactionMock)
      ),
      __transaction: transactionMock
    }
  };
});

vi.mock("bcryptjs", () => ({
  default: {
    compare: bcryptCompareMock,
    hash: bcryptHashMock
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the pending approval status for matching pending users", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
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
    prismaMock.user.findUnique.mockResolvedValue({
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
    prismaMock.user.findUnique.mockResolvedValue({ id: "existing_user" });

    const result = await registerStaffUser(createRegistrationInput());

    expect(result).toEqual({ status: "email_in_use" });
    expect(prismaMock.__transaction.user.create).not.toHaveBeenCalled();
  });

  it("creates new staff registrations in the pending state and records an audit entry", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    bcryptHashMock.mockResolvedValue("hashed-password");
    prismaMock.__transaction.user.create.mockResolvedValue({
      id: "new_user",
      email: "new.staff@swu.local"
    });

    const result = await registerStaffUser(
      createRegistrationInput({ email: " New.Staff@swu.local " })
    );

    expect(bcryptHashMock).toHaveBeenCalledWith("NewStaffPass123!", 12);
    expect(prismaMock.__transaction.user.create).toHaveBeenCalledWith({
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
    expect(prismaMock.__transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "new_user",
        targetUserId: "new_user",
        actionType: "USER_REGISTERED",
        entityType: "USER",
        entityId: "new_user"
      })
    });
    expect(result).toEqual({
      status: "registered",
      userId: "new_user",
      email: "new.staff@swu.local"
    });
  });
});