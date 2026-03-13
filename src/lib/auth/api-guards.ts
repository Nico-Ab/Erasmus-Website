import { UserApprovalStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireApprovedReviewSession() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  }

  if (session.user.status !== UserApprovalStatus.APPROVED) {
    return NextResponse.json(
      { message: "Only approved accounts can access review actions." },
      { status: 403 }
    );
  }

  if (session.user.role !== UserRole.OFFICER && session.user.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { message: "Only officers and admins can perform review actions." },
      { status: 403 }
    );
  }

  return session;
}