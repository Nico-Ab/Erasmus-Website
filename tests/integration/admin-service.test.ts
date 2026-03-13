import { UserApprovalStatus, UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyAdminUserAction } from "@/lib/admin/service";

const { prismaMock } = vi.hoisted(() => {
  const transactionMock = {
    user: {
      update: vi.fn()
    },
    auditLog: {
      create: vi.fn()
    }
  };

  return {
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

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

describe("admin service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("approves a pending staff user and records an audit entry", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_1",
      email: "pending@swu.local",
      role: UserRole.STAFF,
      status: UserApprovalStatus.PENDING,
      firstName: "Pending",
      lastName: "Staff",
      name: "Pending Staff"
    });

    const result = await applyAdminUserAction({
      adminUserId: "admin_user",
      userId: "user_1",
      input: {
        action: "approve"
      }
    });

    expect(prismaMock.__transaction.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: expect.objectContaining({
        status: UserApprovalStatus.APPROVED,
        reviewedById: "admin_user"
      })
    });
    expect(prismaMock.__transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "admin_user",
        targetUserId: "user_1",
        actionType: "USER_APPROVED",
        entityId: "user_1"
      })
    });
    expect(result).toEqual({
      status: "updated",
      message: "User approved successfully."
    });
  });

  it("changes the role of an approved user after confirmation and audits it", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_2",
      email: "staff@swu.local",
      role: UserRole.STAFF,
      status: UserApprovalStatus.APPROVED,
      firstName: "Elena",
      lastName: "Petrova",
      name: "Elena Petrova"
    });

    const result = await applyAdminUserAction({
      adminUserId: "admin_user",
      userId: "user_2",
      input: {
        action: "changeRole",
        role: UserRole.OFFICER,
        confirmationText: "staff@swu.local"
      }
    });

    expect(prismaMock.__transaction.user.update).toHaveBeenCalledWith({
      where: { id: "user_2" },
      data: expect.objectContaining({
        role: UserRole.OFFICER,
        reviewedById: "admin_user"
      })
    });
    expect(prismaMock.__transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "admin_user",
        targetUserId: "user_2",
        actionType: "USER_ROLE_CHANGED",
        entityId: "user_2"
      })
    });
    expect(result).toEqual({
      status: "updated",
      message: "User role updated successfully."
    });
  });

  it("deactivates a user after confirmation and audits it", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_3",
      email: "officer@swu.local",
      role: UserRole.OFFICER,
      status: UserApprovalStatus.APPROVED,
      firstName: "Milan",
      lastName: "Georgiev",
      name: "Milan Georgiev"
    });

    const result = await applyAdminUserAction({
      adminUserId: "admin_user",
      userId: "user_3",
      input: {
        action: "deactivate",
        confirmationText: "officer@swu.local"
      }
    });

    expect(prismaMock.__transaction.user.update).toHaveBeenCalledWith({
      where: { id: "user_3" },
      data: expect.objectContaining({
        status: UserApprovalStatus.DEACTIVATED,
        reviewedById: "admin_user"
      })
    });
    expect(prismaMock.__transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "admin_user",
        targetUserId: "user_3",
        actionType: "USER_DEACTIVATED",
        entityId: "user_3"
      })
    });
    expect(result).toEqual({
      status: "updated",
      message: "User deactivated successfully."
    });
  });

  it("rejects incorrect confirmation text before any destructive action", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user_4",
      email: "staff2@swu.local",
      role: UserRole.STAFF,
      status: UserApprovalStatus.APPROVED,
      firstName: "Nadia",
      lastName: "Koleva",
      name: "Nadia Koleva"
    });

    const result = await applyAdminUserAction({
      adminUserId: "admin_user",
      userId: "user_4",
      input: {
        action: "deactivate",
        confirmationText: "wrong@swu.local"
      }
    });

    expect(prismaMock.__transaction.user.update).not.toHaveBeenCalled();
    expect(prismaMock.__transaction.auditLog.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "invalid_confirmation",
      message: "Type staff2@swu.local exactly to confirm this action."
    });
  });
});