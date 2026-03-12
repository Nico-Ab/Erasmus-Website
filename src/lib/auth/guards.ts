import { UserApprovalStatus, UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { buildLoginStatePath, buildPendingApprovalPath } from "@/lib/auth/paths";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

export async function requireApprovedAuth() {
  const session = await requireAuth();

  if (session.user.status === UserApprovalStatus.PENDING) {
    redirect(buildPendingApprovalPath({ email: session.user.email }));
  }

  if (session.user.status === UserApprovalStatus.REJECTED) {
    redirect(buildLoginStatePath("rejected"));
  }

  if (session.user.status === UserApprovalStatus.DEACTIVATED) {
    redirect(buildLoginStatePath("deactivated"));
  }

  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireApprovedAuth();

  if (!roles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  return session;
}