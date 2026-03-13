import { UserApprovalStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createMobilityCaseForStaff,
  getMobilityCaseRedirectPath
} from "@/lib/mobility-case/service";
import {
  mobilityCaseMutationSchema,
  mobilityCaseSubmitSchema
} from "@/lib/validation/mobility-case";

async function requireApprovedStaffSession() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "Sign in to continue." }, { status: 401 });
  }

  if (session.user.status !== UserApprovalStatus.APPROVED) {
    return NextResponse.json(
      { message: "Only approved staff accounts can manage mobility cases." },
      { status: 403 }
    );
  }

  if (session.user.role !== UserRole.STAFF) {
    return NextResponse.json(
      { message: "Only staff users can create mobility cases." },
      { status: 403 }
    );
  }

  return session;
}

export async function POST(request: Request) {
  const session = await requireApprovedStaffSession();

  if (session instanceof NextResponse) {
    return session;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = mobilityCaseMutationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Case details are invalid.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  if (parsed.data.intent === "submit") {
    const submitParsed = mobilityCaseSubmitSchema.safeParse(parsed.data);

    if (!submitParsed.success) {
      return NextResponse.json(
        {
          message: "Complete the required fields before submitting the case.",
          fieldErrors: submitParsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }
  }

  const result = await createMobilityCaseForStaff(session.user.id, parsed.data, parsed.data.intent);

  if (result.status === "invalid_academic_year") {
    return NextResponse.json(
      {
        message: "Select a valid academic year.",
        fieldErrors: {
          academicYearId: ["Select a valid academic year."]
        }
      },
      { status: 400 }
    );
  }

  if (result.status === "invalid_mobility_type") {
    return NextResponse.json(
      {
        message: "Select a valid mobility type.",
        fieldErrors: {
          mobilityTypeOptionId: ["Select a valid mobility type."]
        }
      },
      { status: 400 }
    );
  }

  if (result.status !== "created") {
    return NextResponse.json({ message: "The mobility case could not be created." }, { status: 500 });
  }

  return NextResponse.json(
    {
      message:
        parsed.data.intent === "submit"
          ? "Mobility case submitted successfully."
          : "Mobility case draft saved successfully.",
      caseId: result.caseId,
      redirectTo: getMobilityCaseRedirectPath(result.caseId, parsed.data.intent)
    },
    { status: 201 }
  );
}