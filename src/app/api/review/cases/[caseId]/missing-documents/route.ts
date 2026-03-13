import { NextResponse } from "next/server";
import { requireApprovedReviewSession } from "@/lib/auth/api-guards";
import { markMissingDocumentForReview } from "@/lib/review-workflow/service";
import { markMissingDocumentSchema } from "@/lib/validation/review-workflow";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
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

  const parsed = markMissingDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Missing-document details are invalid.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const { caseId } = await context.params;
  const result = await markMissingDocumentForReview(
    session.user.id,
    caseId,
    parsed.data.documentTypeKey,
    parsed.data.note
  );

  if (result.status === "created") {
    return NextResponse.json({ message: "Missing-document note recorded successfully." }, { status: 201 });
  }

  if (result.status === "not_found") {
    return NextResponse.json({ message: result.message }, { status: 404 });
  }

  return NextResponse.json({ message: result.message }, { status: 409 });
}