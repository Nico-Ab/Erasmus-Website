import { NextResponse } from "next/server";
import { requireApprovedReviewSession } from "@/lib/auth/api-guards";
import { changeReviewCaseStatus } from "@/lib/review-workflow/service";
import { reviewCaseStatusSchema } from "@/lib/validation/review-workflow";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireApprovedReviewSession();

  if (session instanceof NextResponse) {
    return session;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = reviewCaseStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Status change details are invalid.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const { caseId } = await context.params;
  const result = await changeReviewCaseStatus(
    session.user.id,
    caseId,
    parsed.data.nextStatusKey,
    parsed.data.note
  );

  if (result.status === "updated") {
    return NextResponse.json({ message: "Case status updated successfully." });
  }

  if (result.status === "not_found") {
    return NextResponse.json({ message: result.message }, { status: 404 });
  }

  if (result.status === "no_change") {
    return NextResponse.json({ message: result.message }, { status: 409 });
  }

  return NextResponse.json({ message: result.message }, { status: 400 });
}