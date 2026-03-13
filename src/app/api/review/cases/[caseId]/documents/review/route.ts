import { NextResponse } from "next/server";
import { requireApprovedReviewSession } from "@/lib/auth/api-guards";
import { reviewDocumentVersion } from "@/lib/review-workflow/service";
import { reviewDocumentDecisionSchema } from "@/lib/validation/review-workflow";

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

  const parsed = reviewDocumentDecisionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Document review details are invalid.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const { caseId } = await context.params;
  const result = await reviewDocumentVersion(
    session.user.id,
    caseId,
    parsed.data.versionId,
    parsed.data.decision,
    parsed.data.reason
  );

  if (result.status === "reviewed") {
    return NextResponse.json({ message: "Document review saved successfully." });
  }

  if (result.status === "not_found") {
    return NextResponse.json({ message: result.message }, { status: 404 });
  }

  if (result.status === "not_current_version") {
    return NextResponse.json({ message: result.message }, { status: 409 });
  }

  return NextResponse.json({ message: result.message }, { status: 400 });
}