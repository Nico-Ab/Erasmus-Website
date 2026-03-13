import { Prisma, UserApprovalStatus, UserRole } from "@prisma/client";
import { createAuditLog } from "@/lib/audit/service";
import { auditActionTypes, auditEntityTypes } from "@/lib/audit/constants";
import { prisma } from "@/lib/prisma";
import type { AdminUserActionInput } from "@/lib/validation/admin-users";

const adminUserSelect = {
  id: true,
  name: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  reviewedAt: true,
  reviewedBy: {
    select: {
      name: true,
      firstName: true,
      lastName: true,
      email: true
    }
  }
} satisfies Prisma.UserSelect;

export async function getAdminUserManagementData() {
  const users = await prisma.user.findMany({
    select: adminUserSelect,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  return {
    users,
    pendingCount: users.filter((user) => user.status === UserApprovalStatus.PENDING).length
  };
}

type AdminUserActionResult =
  | { status: "updated"; message: string }
  | { status: "not_found" | "invalid_target" | "invalid_confirmation" | "invalid_state" | "no_change" | "self_forbidden"; message: string };

export async function applyAdminUserAction(params: {
  adminUserId: string;
  userId: string;
  input: AdminUserActionInput;
}): Promise<AdminUserActionResult> {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      firstName: true,
      lastName: true,
      name: true
    }
  });

  if (!user) {
    return {
      status: "not_found",
      message: "User record was not found."
    };
  }

  if (params.userId === params.adminUserId && (params.input.action === "changeRole" || params.input.action === "deactivate")) {
    return {
      status: "self_forbidden",
      message: "Admins cannot change their own role or deactivate themselves from this page."
    };
  }

  if (params.input.action !== "approve") {
    const confirmationText = params.input.confirmationText.trim().toLowerCase();

    if (confirmationText !== user.email.toLowerCase()) {
      return {
        status: "invalid_confirmation",
        message: `Type ${user.email} exactly to confirm this action.`
      };
    }
  }

  if (params.input.action === "approve") {
    if (user.role !== UserRole.STAFF) {
      return {
        status: "invalid_target",
        message: "Only staff registrations can be approved from this page."
      };
    }

    if (user.status === UserApprovalStatus.APPROVED) {
      return {
        status: "no_change",
        message: "This user is already approved."
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: user.id },
        data: {
          status: UserApprovalStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedById: params.adminUserId
        }
      });

      await createAuditLog(transaction, {
        actorUserId: params.adminUserId,
        targetUserId: user.id,
        actionType: auditActionTypes.userApproved,
        entityType: auditEntityTypes.user,
        entityId: user.id,
        summary: `Admin approved staff registration for ${user.email}.`,
        details: {
          previousStatus: user.status,
          nextStatus: UserApprovalStatus.APPROVED
        }
      });
    });

    return { status: "updated", message: "User approved successfully." };
  }

  if (params.input.action === "reject") {
    if (user.role !== UserRole.STAFF) {
      return {
        status: "invalid_target",
        message: "Only staff registrations can be rejected from this page."
      };
    }

    if (user.status === UserApprovalStatus.REJECTED) {
      return {
        status: "no_change",
        message: "This registration is already rejected."
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: user.id },
        data: {
          status: UserApprovalStatus.REJECTED,
          reviewedAt: new Date(),
          reviewedById: params.adminUserId
        }
      });

      await createAuditLog(transaction, {
        actorUserId: params.adminUserId,
        targetUserId: user.id,
        actionType: auditActionTypes.userRejected,
        entityType: auditEntityTypes.user,
        entityId: user.id,
        summary: `Admin rejected staff registration for ${user.email}.`,
        details: {
          previousStatus: user.status,
          nextStatus: UserApprovalStatus.REJECTED
        }
      });
    });

    return { status: "updated", message: "Registration rejected successfully." };
  }

  if (params.input.action === "changeRole") {
    const nextRole = params.input.role;

    if (user.status !== UserApprovalStatus.APPROVED) {
      return {
        status: "invalid_state",
        message: "Only approved users can change role from this page."
      };
    }

    if (user.role === nextRole) {
      return {
        status: "no_change",
        message: "Select a different role before saving."
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: user.id },
        data: {
          role: nextRole,
          reviewedAt: new Date(),
          reviewedById: params.adminUserId
        }
      });

      await createAuditLog(transaction, {
        actorUserId: params.adminUserId,
        targetUserId: user.id,
        actionType: auditActionTypes.userRoleChanged,
        entityType: auditEntityTypes.user,
        entityId: user.id,
        summary: `Admin changed role for ${user.email} from ${user.role} to ${nextRole}.`,
        details: {
          previousRole: user.role,
          nextRole
        }
      });
    });

    return { status: "updated", message: "User role updated successfully." };
  }

  if (user.status === UserApprovalStatus.DEACTIVATED) {
    return {
      status: "no_change",
      message: "This user is already deactivated."
    };
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: user.id },
      data: {
        status: UserApprovalStatus.DEACTIVATED,
        reviewedAt: new Date(),
        reviewedById: params.adminUserId
      }
    });

    await createAuditLog(transaction, {
      actorUserId: params.adminUserId,
      targetUserId: user.id,
      actionType: auditActionTypes.userDeactivated,
      entityType: auditEntityTypes.user,
      entityId: user.id,
      summary: `Admin deactivated ${user.email}.`,
      details: {
        previousStatus: user.status,
        nextStatus: UserApprovalStatus.DEACTIVATED
      }
    });
  });

  return { status: "updated", message: "User deactivated successfully." };
}