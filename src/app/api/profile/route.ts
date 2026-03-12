import { UserApprovalStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateOwnProfile } from "@/lib/profile/service";
import { profileSchema } from "@/lib/validation/profile";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "Sign in to update your profile." }, { status: 401 });
  }

  if (session.user.status !== UserApprovalStatus.APPROVED) {
    return NextResponse.json(
      { message: "Only approved accounts can update profile details." },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Profile details are invalid.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const result = await updateOwnProfile(session.user.id, parsed.data);

  if (result.status === "email_in_use") {
    return NextResponse.json(
      {
        message: "Another account already uses this email address.",
        fieldErrors: {
          email: ["Another account already uses this email address."]
        }
      },
      { status: 409 }
    );
  }

  if (result.status === "invalid_academic_title") {
    return NextResponse.json(
      {
        message: "Select a valid academic title.",
        fieldErrors: {
          academicTitleOptionId: ["Select a valid academic title."]
        }
      },
      { status: 400 }
    );
  }

  if (result.status === "invalid_faculty") {
    return NextResponse.json(
      {
        message: "Select a valid faculty.",
        fieldErrors: {
          facultyId: ["Select a valid faculty."]
        }
      },
      { status: 400 }
    );
  }

  if (result.status === "invalid_department" || result.status === "department_mismatch") {
    return NextResponse.json(
      {
        message: "Select a department that belongs to the selected faculty.",
        fieldErrors: {
          departmentId: ["Select a department that belongs to the selected faculty."]
        }
      },
      { status: 400 }
    );
  }

  if (result.status === "not_found") {
    return NextResponse.json({ message: "Profile record was not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Profile updated successfully.", user: result.user });
}