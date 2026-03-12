"use server";

import { UserApprovalStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { updateRegistrationStatus } from "@/lib/auth/service";

async function setRegistrationStatus(formData: FormData, status: "APPROVED" | "REJECTED") {
  const session = await requireRole([UserRole.ADMIN]);
  const userId = formData.get("userId");

  if (typeof userId !== "string" || userId.length === 0) {
    return;
  }

  await updateRegistrationStatus({
    adminUserId: session.user.id,
    userId,
    status
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
}

export async function approveRegistrationAction(formData: FormData) {
  await setRegistrationStatus(formData, UserApprovalStatus.APPROVED);
}

export async function rejectRegistrationAction(formData: FormData) {
  await setRegistrationStatus(formData, UserApprovalStatus.REJECTED);
}